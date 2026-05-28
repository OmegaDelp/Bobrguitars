import { useState, useEffect } from 'react';
import { db, isSupabaseConfigured } from './lib/supabase';
import { Product, CartItem, Order, Profile } from './types';
import ProductCard from './components/ProductCard';
import DevPanel from './components/DevPanel';
import AuthProfile from './components/AuthProfile';
import {
  Guitar,
  Heart,
  ShoppingCart,
  User,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  X,
  CreditCard,
  Trash2,
  Trash,
  Phone,
  Mail,
  Clock,
  Car,
  TrendingUp,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Global Database state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>({ name: 'Покупатель', avatar: 'П' });

  // Navigation and details
  const [activeTab, setActiveTab] = useState<'catalog' | 'favorites' | 'cart' | 'contacts' | 'profile' | 'detail'>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Filters state
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');

  // Interactive feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all initial state
  const loadAppState = async () => {
    setLoading(true);
    try {
      const prods = await db.getProducts();
      setProducts(prods);

      const userProfile = await db.getProfile();
      setCurrentUser(userProfile);

      const userUid = userProfile.id || 'local-user';
      const userCart = await db.getCart(userUid);
      setCart(userCart);

      const userFavs = await db.getFavorites(userUid);
      setFavorites(userFavs);

      const userOrders = await db.getOrders(userUid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading app state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppState();
  }, []);

  // Sync state when profile is actively updated/logged in via AuthProfile
  const handleProfileUpdated = async (updated: Profile) => {
    setCurrentUser(updated);
    const userUid = updated.id || 'local-user';
    
    // Fetch user specific data
    const userCart = await db.getCart(userUid);
    setCart(userCart);
    const userFavs = await db.getFavorites(userUid);
    setFavorites(userFavs);
    const userOrders = await db.getOrders(userUid);
    setOrders(userOrders);
  };

  const handleLogout = () => {
    setCurrentUser({ name: 'Покупатель', avatar: 'П' });
    setCart([]);
    setFavorites([]);
    setOrders([]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- ACTIONS ---
  const handleAddToCart = async (productId: number, qtyDelta: number = 1) => {
    const userId = currentUser.id || 'local-user';
    const existing = cart.find(c => c.product_id === productId);
    const newQty = (existing?.qty || 0) + qtyDelta;

    if (newQty <= 0) {
      const updatedCart = await db.updateCartItem(productId, 0, userId);
      setCart(updatedCart);
      showToast('🗑️ Товар удален из корзины');
    } else {
      const updatedCart = await db.updateCartItem(productId, newQty, userId);
      setCart(updatedCart);
      if (qtyDelta > 0 && !existing) {
        showToast('🛒 Добавлено в корзину!');
      }
    }
  };

  const handleRemoveFromCart = async (productId: number) => {
    const userId = currentUser.id || 'local-user';
    const updatedCart = await db.updateCartItem(productId, 0, userId);
    setCart(updatedCart);
    showToast('🗑️ Товар удален из корзины');
  };

  const handleToggleFavorite = async (productId: number) => {
    const userId = currentUser.id || 'local-user';
    const updatedFavs = await db.toggleFavorite(productId, userId);
    setFavorites(updatedFavs);
    
    const isNowFav = updatedFavs.includes(productId);
    showToast(isNowFav ? '❤️ Добавлено в избранное' : '💔 Удалено из избранного');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const userId = currentUser.id || 'local-user';
    
    setLoading(true);
    try {
      await db.createOrder(cart, products, userId);
      setCart([]);
      
      // Reload orders
      const userOrders = await db.getOrders(userId);
      setOrders(userOrders);
      
      // Navigate to profile/orders tab immediately to showcase it!
      setActiveTab('profile');
      showToast('🎉 Заказ оформлен успешно! Проверьте во вкладке Профиль.');
    } catch (err) {
      console.error(err);
      showToast('❌ Ошибка оформления заказа');
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const getFilteredProducts = () => {
    let result = [...products];

    // Category filter
    if (currentCategory !== 'all') {
      result = result.filter(p => p.category === currentCategory);
    }

    // Max Price filter
    result = result.filter(p => {
      const price = p.old_price || p.price;
      return price <= maxPrice;
    });

    // Text query search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.old_price || a.price) - (b.old_price || b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.old_price || b.price) - (a.old_price || a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  };

  // Computed mini-cart sums
  const totalCartQty = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCartPrice = cart.reduce((acc, curr) => {
    const prod = products.find(p => p.id === curr.product_id);
    if (!prod) return acc;
    const price = prod.old_price || prod.price;
    return acc + (price * curr.qty);
  }, 0);

  // Selected product logic for Detail Page
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 font-sans flex flex-col justify-between">
      
      {/* TOAST SYSTEM ACCORDING TO USER MANIFESTO */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-neutral-100 px-6 py-3 rounded-full text-xs font-semibold shadow-xl tracking-wide flex items-center gap-2 border border-neutral-800"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION - ACCORDING TO HERO THEME & VISUAL PAIRINGS */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 flex-wrap gap-4 py-2">
            
            {/* BRAND LOGO */}
            <div 
              onClick={() => { setActiveTab('catalog'); setSelectedProductId(null); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-500/10 group-hover:scale-105 transition duration-300">
                <Guitar className="w-6 h-6 rotate-45" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 group-hover:text-red-500 transition duration-200">
                  GuitarShop
                </h1>
                <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Гранд-магазин музыкальных инструментов</p>
              </div>
            </div>

            {/* NAVIGATION MENU */}
            <nav className="flex items-center gap-2 md:gap-4 flex-wrap">
              <button
                onClick={() => { setActiveTab('catalog'); setSelectedProductId(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  activeTab === 'catalog' || activeTab === 'detail' ? 'bg-red-50 text-red-500' : 'text-neutral-600 hover:text-red-500 hover:bg-neutral-50'
                }`}
              >
                <Guitar className="w-4 h-4" />
                <span>Каталог</span>
              </button>

              <button
                onClick={() => { setActiveTab('favorites'); setSelectedProductId(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  activeTab === 'favorites' ? 'bg-red-50 text-red-500' : 'text-neutral-600 hover:text-red-500 hover:bg-neutral-50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Избранное</span>
                {favorites.length > 0 && (
                  <span className="bg-red-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveTab('contacts'); setSelectedProductId(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  activeTab === 'contacts' ? 'bg-red-50 text-red-500' : 'text-neutral-600 hover:text-red-500 hover:bg-neutral-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Контакты</span>
              </button>

              <button
                onClick={() => { setActiveTab('profile'); setSelectedProductId(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  activeTab === 'profile' ? 'bg-red-50 text-red-500' : 'text-neutral-600 hover:text-red-500 hover:bg-neutral-50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Профиль</span>
              </button>

              <button
                onClick={() => { setActiveTab('cart'); setSelectedProductId(null); }}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  activeTab === 'cart' ? 'bg-neutral-900 text-white' : 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/10'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Корзина</span>
                <span className="bg-white text-neutral-900 rounded-full text-[10px] px-2 py-0.5 font-bold">
                  {totalCartQty}
                </span>
              </button>
            </nav>

            {/* MINI PROFILE TOGGLER */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 bg-neutral-50 hover:bg-neutral-100 p-1.5 pr-4 rounded-full border border-neutral-100 cursor-pointer transition duration-200 select-none"
            >
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold shadow-inner">
                {currentUser?.avatar}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-neutral-800">{currentUser?.name}</div>
                <div className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wide">Пользователь</div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* UPPER SUPABASE DEV DIAGNOSTIC CONTROL - ESSENTIAL FOR DIPLOMA */}
        <div className="mb-8">
          <DevPanel onDatabaseAction={loadAppState} />
        </div>

        {/* LOADING INDICATOR */}
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-neutral-500">Загрузка базы данных GuitarShop...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT FILTER BAR - DISPLAYED EXCLUSIVELY ON CATALOG */}
            {activeTab === 'catalog' && (
              <aside className="lg:col-span-1 space-y-6">
                
                {/* CATEGORIES NAVIGATION */}
                <div className="bg-white rounded-[28px] border border-neutral-100 p-5 shadow-sm space-y-1">
                  <h3 className="font-bold text-sm uppercase text-neutral-400 tracking-wider mb-3 px-2">Категории</h3>
                  {[
                    { id: 'all', label: 'Все инструменты', icon: null },
                    { id: 'acoustic', label: 'Акустические гитары', icon: '🎸' },
                    { id: 'electric', label: 'Электрогитары', icon: '⚡' },
                    { id: 'bass', label: 'Бас-гитары', icon: '🎵' },
                    { id: 'ukulele', label: 'Укулеле', icon: '🪕' },
                    { id: 'accessory', label: 'Аксессуары', icon: '🔧' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                        currentCategory === cat.id
                          ? 'bg-red-50 text-red-500'
                          : 'text-neutral-600 hover:text-red-500 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        <span>{cat.label}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  ))}
                </div>

                {/* SLIDING PRICE CONTROL */}
                <div className="bg-white rounded-[28px] border border-neutral-100 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm uppercase text-neutral-400 tracking-wider px-1">Цена по бюджету</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={1000}
                      max={300000}
                      step={1000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-red-500 h-1 bg-neutral-100 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
                      <span>1 000 ₽</span>
                      <span className="bg-red-50 text-red-500 px-2.5 py-1 rounded-md">до {maxPrice.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>

                {/* HIT SHOWCASE IN MARGIN RAIL */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-[28px] p-6 shadow-xl relative overflow-hidden select-none">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-500/20 rounded-full blur-2xl"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-full">
                      <Award className="w-3.5 h-3.5" /> Хит продаж
                    </div>
                    <div className="text-center font-sans">
                      <span className="text-6xl my-2 block drop-shadow-lg">🎸⚡</span>
                      <h4 className="font-bold text-sm leading-snug mt-3">Fender Player Stratocaster</h4>
                      <p className="text-neutral-400 text-[11px] mt-1">Олицетворение великолепного звука рок-н-ролла.</p>
                      <button 
                        onClick={() => { setSelectedProductId(3); setActiveTab('detail'); }}
                        className="mt-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs py-2 px-5 rounded-full cursor-pointer shadow-md transition w-full"
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                </div>

              </aside>
            )}

            {/* MAIN CENTRAL DYNAMIC GRID BLOCK */}
            <div className={`${activeTab === 'catalog' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
              
              {/* CATALOG VIEWS - RENDERS CATEGORIES & FILTER ENGINE */}
              {activeTab === 'catalog' && (
                <div className="space-y-6">
                  {/* TOP SEARCH & SORTING BAR */}
                  <div className="bg-white rounded-[28px] border border-neutral-100 p-4.5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Brand Search Bar */}
                    <div className="relative w-full md:flex-1">
                      <Search className="w-4.5 h-4.5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Поиск по названию или бренду (Fender, Gibson, Yamaha...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-50/50 hover:bg-neutral-50 focus:bg-white border border-neutral-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/25 transition duration-200"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Sorting selectors */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      <SlidersHorizontal className="w-4 h-4 text-neutral-400 shrink-0 hidden md:block" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-48 bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-red-300 transition duration-200 cursor-pointer"
                      >
                        <option value="default">Сортировка: По умолчанию</option>
                        <option value="price-asc">Цена: по возрастанию</option>
                        <option value="price-desc">Цена: по убыванию</option>
                        <option value="name">Название: А-Я</option>
                        <option value="rating">По рейтингу</option>
                      </select>
                    </div>

                  </div>

                  {/* CARDS LISTING GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {getFilteredProducts().map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        isInCart={cart.some(c => c.product_id === product.id)}
                        onAddToCart={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.id, 1);
                        }}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(product.id);
                        }}
                        onClick={() => {
                          setSelectedProductId(product.id);
                          setActiveTab('detail');
                        }}
                      />
                    ))}

                    {getFilteredProducts().length === 0 && (
                      <div className="col-span-full py-16 bg-white border border-neutral-100 rounded-[32px] text-center text-neutral-400 shadow-sm space-y-2">
                        <Search className="w-12 h-12 text-neutral-300 mx-auto" />
                        <p className="font-bold text-neutral-700 text-sm">Guitars not found.</p>
                        <p className="text-xs text-neutral-400">Попробуйте снизить планку цены или изменить поисковый запрос.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* FAVORITES VIEW */}
              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Избранные гитары</h2>
                  
                  {favorites.length === 0 ? (
                    <div className="bg-white border border-neutral-100 rounded-[32px] p-16 text-center text-neutral-400 shadow-sm space-y-3">
                      <Heart className="w-12 h-12 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-700">Тут пока пусто</p>
                      <p className="text-xs text-neutral-400">Добавляйте любые понравившиеся инструменты в избранное кнопкой в каталоге.</p>
                      <button 
                        onClick={() => setActiveTab('catalog')}
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs py-2.5 px-6 rounded-full cursor-pointer shadow-md transition"
                      >
                        Перейти в каталог
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {products
                        .filter(p => favorites.includes(p.id))
                        .map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isFavorite={true}
                            isInCart={cart.some(c => c.product_id === product.id)}
                            onAddToCart={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product.id, 1);
                            }}
                            onToggleFavorite={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(product.id);
                            }}
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setActiveTab('detail');
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTACTS PAGE */}
              {activeTab === 'contacts' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-red-500 animate-bounce" />
                    Контакты шоурума
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <MapPin className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-neutral-800">Адрес шоурума:</strong>
                          <p className="text-neutral-500 mt-0.5">г. Москва, ул. Музыкальная, д. 7, ТЦ «Аккорд», 2 этаж</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Phone className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-neutral-800">Контактный телефон:</strong>
                          <p className="text-neutral-500 mt-0.5">+7 (495) 123-45-67</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Mail className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-neutral-800">Электронная почта:</strong>
                          <p className="text-neutral-500 mt-0.5">info@guitarshop.ru</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        <Clock className="w-5 h-5 text-neutral-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="text-neutral-800">Время работы:</strong>
                          <p className="text-neutral-500 mt-0.5">Пн-Сб 10:00–21:00, Вс 11:00–19:00</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                      <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                        <Car className="w-4 h-4 text-neutral-500" /> Собственная парковка
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Для посетителей GuitarShop доступно 30 парковочных мест абсолютно бесплатно на территории ТЦ. При покупке выдается пропуск на выезд.
                      </p>
                      
                      <div className="pt-3 border-t border-neutral-200 flex gap-2 items-center">
                        <Info className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Перед визитом можно зарезервировать инструмент</span>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic visual Map Placeholder */}
                  <div className="relative h-64 bg-slate-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                    <div className="absolute inset-0 bg-neutral-800 opacity-20 z-0"></div>
                    <div className="text-center z-10 p-6 space-y-2">
                      <span className="text-4xl">📍</span>
                      <h4 className="font-bold text-neutral-800 text-sm">Интерактивный ориентир</h4>
                      <p className="text-neutral-500 text-xs text-center max-w-sm">Метро «Новокузнецкая» в 3 минутах пешком. Проход через центральные арки ТЦ.</p>
                      <span className="inline-block bg-white border border-neutral-100 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm text-neutral-600">Координаты: 55.739722, 37.629167</span>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* USER PROFILE TAB */}
              {activeTab === 'profile' && (
                <AuthProfile
                  currentUser={currentUser}
                  orders={orders}
                  onProfileUpdated={handleProfileUpdated}
                  onLogout={handleLogout}
                />
              )}

              {/* INTEGRATED SHOPPING CART PAGE */}
              {activeTab === 'cart' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Корзина товаров</h2>

                  {cart.length === 0 ? (
                    <div className="bg-white border border-neutral-100 rounded-[32px] p-16 text-center text-neutral-400 shadow-sm space-y-3">
                      <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-700">В корзине пока ничего нет</p>
                      <p className="text-xs text-neutral-400">Ваша корзина пуста. Отправляйтесь в каталог за лучшими инструментами.</p>
                      <button 
                        onClick={() => setActiveTab('catalog')}
                        className="mt-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-xs py-2.5 px-6 rounded-full cursor-pointer shadow-md transition"
                      >
                        Перейти в каталог
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-neutral-100 rounded-[32px] p-6 shadow-sm space-y-6">
                      
                      {/* Products table list in Cart */}
                      <div className="divide-y divide-neutral-100">
                        {cart.map(item => {
                          const product = products.find(p => p.id === item.product_id);
                          if (!product) return null;
                          const singlePrice = product.old_price || product.price;
                          const subtotal = singlePrice * item.qty;

                          return (
                            <div key={item.product_id} className="py-5 flex flex-wrap items-center justify-between gap-4">
                              
                              {/* Left Thumbnail and info */}
                              <div className="flex items-center gap-4 min-w-[200px]">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${product.image_class || 'bg-neutral-50'}`}>
                                  {product.emoji}
                                </div>
                                <div className="text-left">
                                  <h4 className="font-bold text-neutral-800 text-sm line-clamp-1 hover:text-red-500 transition cursor-pointer"
                                      onClick={() => { setSelectedProductId(product.id); setActiveTab('detail'); }}
                                  >
                                    {product.title}
                                  </h4>
                                  <p className="text-[10px] text-neutral-400 font-semibold uppercase">{product.brand}</p>
                                </div>
                              </div>

                              {/* Price modifier block */}
                              <div className="flex items-center gap-6 justify-between flex-1 sm:justify-end">
                                <div className="text-right hidden sm:block">
                                  <div className="text-xs text-neutral-400">Цена за шт.</div>
                                  <div className="font-bold text-neutral-800 text-xs mt-0.5">{singlePrice.toLocaleString()} ₽</div>
                                </div>

                                {/* +/- Buttons */}
                                <div className="flex items-center gap-2.5 bg-neutral-55 border border-neutral-100 px-2 py-1.5 rounded-xl">
                                  <button
                                    onClick={() => handleAddToCart(product.id, -1)}
                                    className="w-7 h-7 bg-white hover:bg-neutral-50 border border-neutral-100 rounded-lg flex items-center justify-center text-xs text-neutral-600 font-bold transition select-none cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="text-xs font-bold w-6 text-center select-none">{item.qty}</span>
                                  <button
                                    onClick={() => handleAddToCart(product.id, 1)}
                                    className="w-7 h-7 bg-white hover:bg-neutral-50 border border-neutral-100 rounded-lg flex items-center justify-center text-xs text-neutral-600 font-bold transition select-none cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Sum price text */}
                                <div className="text-right min-w-[100px]">
                                  <div className="text-xs text-neutral-400 sm:hidden">Итого</div>
                                  <div className="font-bold text-neutral-900 text-sm">{subtotal.toLocaleString()} ₽</div>
                                </div>

                                {/* Delete trash button */}
                                <button
                                  onClick={() => handleRemoveFromCart(product.id)}
                                  className="w-8 h-8 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer transition duration-150"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                      {/* Total invoice block */}
                      <div className="pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">Общий чек покупки</span>
                          <span className="text-2xl font-extrabold text-neutral-900 mt-1 block">
                            {totalCartPrice.toLocaleString()} ₽
                          </span>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                          <button
                            onClick={() => setActiveTab('catalog')}
                            className="flex-1 md:flex-initial bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs py-3.5 px-6 rounded-xl transition cursor-pointer"
                          >
                            Продолжить покупки
                          </button>
                          
                          <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="flex-1 md:flex-initial bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs py-3.5 px-8 rounded-xl shadow-lg shadow-red-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            Оформить заказ
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* PRODUCTS DETAIL FULL SCREEN VIEW */}
              {activeTab === 'detail' && selectedProduct && (
                <div className="space-y-4">
                  {/* Sliding control bar */}
                  <button
                    onClick={() => { setActiveTab('catalog'); setSelectedProductId(null); }}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-500 font-bold cursor-pointer transition mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Вернуться к каталогу товаров</span>
                  </button>

                  <div className="bg-white border border-neutral-100 rounded-[32px] p-6 md:p-8 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      
                      {/* Product display card */}
                      <div className={`h-80 md:h-[380px] rounded-2xl flex items-center justify-center relative ${selectedProduct.image_class || 'bg-neutral-50'}`}>
                        {selectedProduct.badge && (
                          <span className={`absolute top-6 left-6 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white ${
                            selectedProduct.badge === 'sale' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}>
                            {selectedProduct.badge === 'sale' ? 'Скидка' : 'Новинка'}
                          </span>
                        )}
                        <span className="text-[9.5rem] select-none drop-shadow-xl">
                          {selectedProduct.emoji}
                        </span>
                      </div>

                      {/* Technical specifications info */}
                      <div className="space-y-5 text-left">
                        <div>
                          <span className="inline-block bg-red-50 text-red-500 font-semibold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                            {selectedProduct.category}
                          </span>
                          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-3 leading-snug">
                            {selectedProduct.title}
                          </h2>
                          <p className="text-xs text-neutral-400 font-semibold mt-1">Производитель: {selectedProduct.brand}</p>
                        </div>

                        {/* Rating Row */}
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-400">
                            {'★'.repeat(Math.round(selectedProduct.rating))}
                            {'☆'.repeat(5 - Math.round(selectedProduct.rating))}
                          </div>
                          <span className="text-xs font-bold text-neutral-800">{selectedProduct.rating}</span>
                          <span className="text-xs text-neutral-400">({selectedProduct.reviews} отзывов)</span>
                        </div>

                        {/* Pricing details */}
                        <div className="py-2 border-y border-neutral-50 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-neutral-400">Цена в магазине:</span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              {selectedProduct.old_price && (
                                <span className="text-sm text-neutral-400 line-through">
                                  {(selectedProduct.old_price).toLocaleString()} ₽
                                </span>
                              )}
                              <span className="text-2xl font-extrabold text-neutral-900">
                                {selectedProduct.price.toLocaleString()} ₽
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                            <span className="text-xs text-neutral-500 font-semibold uppercase">В наличии</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Описание инструмента</h4>
                          <p className="text-xs md:text-sm text-neutral-600 leading-relaxed mt-1.5">
                            {selectedProduct.description}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-3 pt-3">
                          <button
                            onClick={() => handleAddToCart(selectedProduct.id, 1)}
                            className={`flex-1 min-w-[140px] text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                              cart.some(c => c.product_id === selectedProduct.id)
                                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                                : 'bg-red-500 hover:bg-red-600 shadow-red-500/10'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {cart.some(c => c.product_id === selectedProduct.id) ? 'Добавить ещё' : 'В корзину'}
                          </button>

                          <button
                            onClick={() => handleToggleFavorite(selectedProduct.id)}
                            className={`px-5 py-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                              favorites.includes(selectedProduct.id)
                                ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100/50'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-100 hover:bg-neutral-100'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${favorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                            {favorites.includes(selectedProduct.id) ? 'В избранном' : 'В избранное'}
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Detailed Specifications Box */}
                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                      <h3 className="font-extrabold text-neutral-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5">
                        <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                        Технические характеристики для диплома
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                        {Object.entries(selectedProduct.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-neutral-200/50">
                            <span className="text-neutral-500 font-medium">{key}:</span>
                            <span className="text-neutral-900 font-bold text-right">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR - CONTAINS MINI CART CHECKOUT DETAILS & BRANDS */}
            <aside className="lg:col-span-1 space-y-6">
              
              {/* INSTANT MINI CART VIEW RAIL */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-[28px] p-5.5 shadow-sm space-y-4">
                <h3 className="font-bold text-neutral-900 text-sm tracking-tight flex items-center gap-1.5">
                  <ShoppingCart className="w-4.5 h-4.5 text-neutral-500" />
                  🛒 Мини-корзина
                </h3>

                {cart.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4">Мини-корзина пока пуста</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {cart.map(item => {
                      const product = products.find(p => p.id === item.product_id);
                      if (!product) return null;
                      const singleP = product.old_price || product.price;
                      return (
                        <div key={item.product_id} className="flex justify-between items-center text-xs py-1.5 border-b border-amber-200/30">
                          <span className="font-medium text-neutral-700 line-clamp-1">{product.title}</span>
                          <span className="font-bold text-neutral-900 whitespace-nowrap shrink-0 pl-2">
                            {item.qty} шт • {(singleP * item.qty).toLocaleString()} ₽
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-amber-200/50">
                  <span className="text-neutral-600">Итого к оплате:</span>
                  <span className="text-sm font-extrabold text-neutral-950">{totalCartPrice.toLocaleString()} ₽</span>
                </div>

                <button
                  disabled={cart.length === 0}
                  onClick={() => setActiveTab('cart')}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-full cursor-pointer shadow-md transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Перейти к оплате
                </button>
              </div>

              {/* POPULAR BRANDS CLOUD */}
              <div className="bg-white border border-neutral-100 rounded-[28px] p-5 shadow-sm space-y-4.5">
                <h3 className="font-bold text-sm uppercase text-neutral-400 tracking-wider">Популярные бренды</h3>
                <div className="flex flex-wrap gap-2">
                  {['Fender', 'Gibson', 'Ibanez', 'Yamaha', 'Taylor', 'Cort', 'Squier'].map(brand => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSearchQuery(brand);
                        setActiveTab('catalog');
                        setCurrentCategory('all');
                      }}
                      className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs px-3.5 py-2 rounded-full font-semibold transition cursor-pointer border border-neutral-100"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* DIPLOMA EXPLANATIONS BRIEF BOARD */}
              <div className="bg-white border border-neutral-100 rounded-[28px] p-5 shadow-sm space-y-4 text-xs leading-relaxed">
                <h3 className="font-extrabold text-neutral-800 text-xs uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                  Инфо для диплома
                </h3>
                <p className="text-neutral-500">
                  Этот сайт разработан на базе связки <strong>React 19 + Supabase</strong> специально для дипломного проектирования.
                </p>
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-50 text-[11px] text-neutral-600">
                  🎯 Встроенный сеятель таблиц позволяет продемонстрировать подключение базы данных в реальном времени комиссии!
                </div>
              </div>

            </aside>

          </div>
        )}

      </main>

      {/* FOOTER ACCORDING TO DESIGN GUIDELINES */}
      <footer className="bg-white border-t border-neutral-100 py-10 mt-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs font-semibold leading-relaxed space-y-2">
          <p>
            🎸 GuitarShop — магазин гитар и музыкального оборудования. Разработано для демонстрации и защиты дипломного проекта.
          </p>
          <p>
            Лицензировано по стандартам Web App 2026. Интеграция базы данных Supabase DB и Auth активирована.
          </p>
        </div>
      </footer>

    </div>
  );
}
