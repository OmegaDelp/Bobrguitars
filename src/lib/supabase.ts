/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, CartItem, Order, Profile } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

// Read config from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';
};

// Initialize real Supabase client (only if credentials are provided)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local persistent store names
const LS_KEYS = {
  PRODUCTS: 'guitarshop_products',
  CART: 'guitarshop_cart',
  FAVORITES: 'guitarshop_favorites',
  PROFILE: 'guitarshop_user',
  ORDERS: 'guitarshop_orders',
};

// Initialize localStorage with dummy data if not present
const getLocalStorageData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const saveLocalStorageData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// SQL code to create database tables
export const SQL_SCHEMA = `-- ИНСТРУМЕНТ К СОЗДАНИЮ ТАБЛИЦ В SUPABASE SQL EDITOR
-- Скопируйте и вставьте этот код в SQL Editor вашего Supabase проекта

-- 1. Таблица профилей пользователей
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  name text not null,
  avatar text,
  email text
);

-- Настройка политики безопасности RLS для профилей
alter table profiles enable row level security;
create policy "Публичные профили" on profiles for select using (true);
create policy "Пользователи могут изменять свой профиль" on profiles for update using (auth.uid() = id);
create policy "Пользователи могут создавать свой профиль" on profiles for insert with check (auth.uid() = id);

-- 2. Таблица товаров (гитар)
create table if not exists products (
  id bigint primary key,
  category text not null,
  title text not null,
  price numeric not null,
  old_price numeric,
  rating numeric not null default 5,
  reviews integer not null default 0,
  badge text,
  emoji text,
  brand text not null,
  specs jsonb not null default '{}'::jsonb,
  description text,
  image_class text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;
create policy "Разрешить всем просмотр товаров" on products for select using (true);
create policy "Разрешить администраторам вставку товаров" on products for all using (true); -- Для простоты диплома

-- 3. Таблица избранного
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  product_id bigint references products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table favorites enable row level security;
create policy "Пользователи могут смотреть свое избранное" on favorites for select using (auth.uid() = user_id);
create policy "Пользователи могут добавлять в свое избранное" on favorites for insert with check (auth.uid() = user_id);
create policy "Пользователи могут удалять из своего избранного" on favorites for delete using (auth.uid() = user_id);

-- 4. Таблица корзины
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  product_id bigint references products(id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

alter table cart_items enable row level security;
create policy "Управление своей корзиной" on cart_items for all using (auth.uid() = user_id);

-- 5. Таблица заказов
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric not null,
  status text not null default 'processing'
);

alter table orders enable row level security;
create policy "Пользователи видят свои заказы" on orders for select using (auth.uid() = user_id);
create policy "Пользователи могут создавать свои заказы" on orders for insert with check (auth.uid() = user_id);
`;

// Helper layer that encapsulates both real Supabase queries and custom LocalStorage fallbacks.
export const db = {
  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          // Map database structure (snake_case) to typescript interface
          return data.map((p: any) => ({
            id: Number(p.id),
            category: p.category,
            title: p.title,
            price: Number(p.price),
            old_price: p.old_price ? Number(p.old_price) : null,
            rating: Number(p.rating),
            reviews: Number(p.reviews),
            badge: p.badge,
            emoji: p.emoji,
            brand: p.brand,
            specs: p.specs,
            description: p.description,
            image_class: p.image_class,
          }));
        }
        
        // If Supabase table is empty, seed it automatically
        console.log('Products table is empty. Auto-seeding initial products...');
        await this.seedProducts();
        return INITIAL_PRODUCTS;
      } catch (err) {
        console.warn('Supabase products fetch failed, using fallback:', err);
      }
    }
    // Storage Fallback
    return getLocalStorageData<Product[]>(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  async seedProducts(): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        // Clear existing just in case (though it's only called when empty)
        const itemsToInsert = INITIAL_PRODUCTS.map(p => ({
          id: p.id,
          category: p.category,
          title: p.title,
          price: p.price,
          old_price: p.old_price,
          rating: p.rating,
          reviews: p.reviews,
          badge: p.badge,
          emoji: p.emoji,
          brand: p.brand,
          specs: p.specs,
          description: p.description,
          image_class: p.image_class,
        }));
        
        const { error } = await supabase.from('products').upsert(itemsToInsert);
        if (error) throw error;
        console.log('Successfully seeded Supabase with initial products!');
        return true;
      } catch (err) {
        console.error('Failed to seed products in Supabase:', err);
        return false;
      }
    }
    return false;
  },

  // --- PROFILE ---
  async getProfile(userId: string = 'local-user'): Promise<Profile> {
    const defaultProfile: Profile = {
      id: userId,
      name: 'Ульяна',
      avatar: 'У',
      email: 'putinzev.ulya@gmail.com'
    };

    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is empty result
        if (data) {
          return {
            id: data.id,
            name: data.name,
            avatar: data.avatar || data.name.charAt(0).toUpperCase(),
            email: data.email,
          };
        } else {
          // If profile doesn't exist, create it
          const newProfile = { ...defaultProfile, id: userId };
          await supabase.from('profiles').insert({
            id: userId,
            name: newProfile.name,
            avatar: newProfile.avatar,
            email: newProfile.email
          });
          return newProfile;
        }
      } catch (err) {
        console.warn('Supabase profile fetch failed, using fallback:', err);
      }
    }
    return getLocalStorageData<Profile>(LS_KEYS.PROFILE, defaultProfile);
  },

  async updateProfile(profile: Profile, userId: string = 'local-user'): Promise<Profile> {
    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            name: profile.name,
            avatar: profile.avatar || profile.name.charAt(0).toUpperCase(),
            email: profile.email
          });
        if (error) throw error;
        return profile;
      } catch (err) {
        console.error('Failed to save profile in Supabase:', err);
      }
    }
    saveLocalStorageData<Profile>(LS_KEYS.PROFILE, profile);
    return profile;
  },

  // --- CART ---
  async getCart(userId: string = 'local-user'): Promise<CartItem[]> {
    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        if (data) {
          return data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            product_id: Number(item.product_id),
            qty: Number(item.qty),
          }));
        }
      } catch (err) {
        console.warn('Supabase cart fetch failed, using fallback:', err);
      }
    }
    return getLocalStorageData<CartItem[]>(LS_KEYS.CART, []);
  },

  async updateCartItem(productId: number, qty: number, userId: string = 'local-user'): Promise<CartItem[]> {
    let currentCart = await this.getCart(userId);
    const existing = currentCart.find(c => c.product_id === productId);

    if (existing) {
      if (qty <= 0) {
        currentCart = currentCart.filter(c => c.product_id !== productId);
      } else {
        existing.qty = qty;
      }
    } else if (qty > 0) {
      currentCart.push({ product_id: productId, qty });
    }

    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        if (qty <= 0) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        } else {
          await supabase
            .from('cart_items')
            .upsert({
              user_id: userId,
              product_id: productId,
              qty: qty
            }, { onConflict: 'user_id,product_id' });
        }
        return currentCart;
      } catch (err) {
        console.error('Failed to sync cart item with Supabase:', err);
      }
    }

    saveLocalStorageData<CartItem[]>(LS_KEYS.CART, currentCart);
    return currentCart;
  },

  async clearCart(userId: string = 'local-user'): Promise<void> {
    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.error('Failed to clear cart in Supabase:', err);
      }
    }
    saveLocalStorageData<CartItem[]>(LS_KEYS.CART, []);
  },

  // --- FAVORITES ---
  async getFavorites(userId: string = 'local-user'): Promise<number[]> {
    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', userId);
        
        if (error) throw error;
        if (data) {
          return data.map((fav: any) => Number(fav.product_id));
        }
      } catch (err) {
        console.warn('Supabase favorites fetch failed, using fallback:', err);
      }
    }
    return getLocalStorageData<number[]>(LS_KEYS.FAVORITES, []);
  },

  async toggleFavorite(productId: number, userId: string = 'local-user'): Promise<number[]> {
    const list = await this.getFavorites(userId);
    const index = list.indexOf(productId);
    let newList = [...list];

    if (index >= 0) {
      newList.splice(index, 1);
      if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
        try {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);
        } catch (err) {
          console.error('Failed to delete favorite in Supabase:', err);
        }
      }
    } else {
      newList.push(productId);
      if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
        try {
          await supabase
            .from('favorites')
            .insert({
              user_id: userId,
              product_id: productId
            });
        } catch (err) {
          console.error('Failed to insert favorite in Supabase:', err);
        }
      }
    }

    if (!isSupabaseConfigured() || userId === 'local-user') {
      saveLocalStorageData<number[]>(LS_KEYS.FAVORITES, newList);
    }
    return newList;
  },

  // --- ORDERS ---
  async getOrders(userId: string = 'local-user'): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) {
          return data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            created_at: item.created_at,
            date: item.date,
            items: item.items,
            total: Number(item.total),
            status: item.status as 'processing' | 'delivered',
          }));
        }
      } catch (err) {
        console.warn('Supabase orders fetch failed, using fallback:', err);
      }
    }
    return getLocalStorageData<Order[]>(LS_KEYS.ORDERS, []);
  },

  async createOrder(items: CartItem[], productsList: Product[], userId: string = 'local-user'): Promise<Order> {
    const fullItems = items.map(c => {
      const p = productsList.find(prod => prod.id === c.product_id)!;
      return {
        product_id: c.product_id,
        qty: c.qty,
        title: p?.title || 'Гитара',
        price: p ? (p.old_price || p.price) : 1000
      };
    });

    const total = fullItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    const orderDate = new Date().toLocaleDateString('ru-RU');

    const newOrder: Order = {
      id: isSupabaseConfigured() && userId !== 'local-user' ? crypto.randomUUID() : Date.now(),
      user_id: userId,
      date: orderDate,
      items: fullItems,
      total: total,
      status: 'processing'
    };

    if (isSupabaseConfigured() && supabase && userId !== 'local-user') {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            date: orderDate,
            items: fullItems,
            total: total,
            status: 'processing'
          })
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          await this.clearCart(userId);
          return {
            id: data.id,
            user_id: data.user_id,
            created_at: data.created_at,
            date: data.date,
            items: data.items,
            total: Number(data.total),
            status: data.status as 'processing' | 'delivered',
          };
        }
      } catch (err) {
        console.error('Failed to save order in Supabase:', err);
      }
    }

    // Storage fallback
    const orders = getLocalStorageData<Order[]>(LS_KEYS.ORDERS, []);
    orders.unshift(newOrder);
    saveLocalStorageData<Order[]>(LS_KEYS.ORDERS, orders);
    saveLocalStorageData<CartItem[]>(LS_KEYS.CART, []); // clear cart
    return newOrder;
  },

  // Simple test method
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        message: 'Supabase URL или Anon Key не заданы в .env. Режим локального хранилища.'
      };
    }
    try {
      // Fast query to check connectivity
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return {
        success: true,
        message: `Успешное подключение к Supabase! Прочитано таблиц. Окружение полностью готово к сдаче диплома.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Ошибка подключения: ${err?.message || err}. Проверьте конфигурацию таблиц и RLS.`
      };
    }
  }
};
