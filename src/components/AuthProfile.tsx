import React, { useState, useEffect } from 'react';
import { supabase, db, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Order } from '../types';
import { User, LogIn, UserPlus, Clipboard, ShieldAlert, CheckCircle2, ChevronRight, UserCheck, LogOut, Package2, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProfileProps {
  currentUser: Profile;
  orders: Order[];
  onProfileUpdated: (updated: Profile) => void;
  onLogout: () => void;
}

export default function AuthProfile({
  currentUser,
  orders,
  onProfileUpdated,
  onLogout,
}: AuthProfileProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('У');
  
  // Local state for registered user session tracking
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Profile editing inputs
  const [editName, setEditName] = useState(currentUser.name);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      // Get current logged-in Supabase Auth session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          loadSupabaseProfile(session.user.id, session.user.email || '');
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          loadSupabaseProfile(session.user.id, session.user.email || '');
        } else {
          setSupabaseUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    setEditName(currentUser.name);
    setEditAvatar(currentUser.avatar);
  }, [currentUser]);

  const loadSupabaseProfile = async (uid: string, userEmail: string) => {
    setLoading(true);
    const profile = await db.getProfile(uid);
    onProfileUpdated({
      id: uid,
      name: profile.name || 'Покупатель',
      avatar: profile.avatar || 'П',
      email: userEmail
    });
    setLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isSupabaseConfigured() && supabase) {
      try {
        if (isLoginMode) {
          // Real Supabase Sign In
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (data.user) {
            setSuccessMsg('Вы успешно вошли в систему!');
            loadSupabaseProfile(data.user.id, data.user.email || '');
          }
        } else {
          // Real Supabase Sign Up
          if (!name.trim()) throw new Error('Пожалуйста, введите ваше имя');
          const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                name: name,
                avatar: name.charAt(0).toUpperCase()
              }
            }
          });
          if (error) throw error;
          if (data.user) {
            setSuccessMsg('Регистрация успешна! Проверьте вашу почту или войдите в систему.');
            // Save local profile entry
            await db.updateProfile({
              name,
              avatar: name.charAt(0).toUpperCase(),
              email
            }, data.user.id);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Ошибка выполнения запроса');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline Simulated Auth
      setTimeout(() => {
        if (isLoginMode) {
          // Simulating login
          onProfileUpdated({
            name: 'Илья',
            avatar: 'И',
            email: email || 'putinzev.ulya@gmail.com'
          });
          setSuccessMsg('Локальный вход выполнен успешно (симуляция)!');
        } else {
          // Simulating sign up
          if (!name.trim()) {
            setErrorMsg('Пожалуйста, укажите имя');
            setLoading(false);
            return;
          }
          onProfileUpdated({
            name: name,
            avatar: name.charAt(0).toUpperCase(),
            email: email || 'putinzev.ulya@gmail.com'
          });
          setSuccessMsg('Локальная регистрация успешна (симуляция)!');
        }
        setLoading(false);
      }, 500);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setLoading(true);
    const updated: Profile = {
      ...currentUser,
      name: editName,
      avatar: editAvatar || editName.charAt(0).toUpperCase(),
    };

    const targetUid = supabaseUser?.id || 'local-user';
    await db.updateProfile(updated, targetUid);
    onProfileUpdated(updated);
    setIsEditing(false);
    setLoading(false);
    setSuccessMsg('Профиль успешно обновлен!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const triggerSignOut = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    onLogout();
    setSupabaseUser(null);
    setEmail('');
    setPassword('');
    setSuccessMsg('Вы вышли из учетной записи.');
  };

  // Check if they are signed-in (either real supabase or filled mail in localStorage)
  const isUserLoggedIn = isSupabaseConfigured() ? !!supabaseUser : !!currentUser.email;

  return (
    <div className="space-y-6 font-sans">
      {!isUserLoggedIn ? (
        /* AUTHENTICATION VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-md max-w-md mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {isLoginMode ? 'Вход в личный кабинет' : 'Регистрация аккаунта'}
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              {isLoginMode ? 'Войдите для синхронизации корзины и заказов' : 'Создайте новый аккаунт в базе данных'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Email-адрес</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.ru"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs flex gap-2 items-start mt-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl text-xs flex gap-2 items-start mt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-500/15 tracking-wide mt-3 cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isLoginMode ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Войти
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-neutral-500 hover:text-red-500 font-medium cursor-pointer transition-colors"
            >
              {isLoginMode ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </motion.div>
      ) : (
        /* LOGGED-IN PROFILE CARD & ORDER HISTORY */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PROFILE CONTROL */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-neutral-100 rounded-[32px] p-6 shadow-md text-center"
            >
              {/* Profile Avatar */}
              <div className="relative group w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
                {currentUser.avatar}
              </div>

              <h3 className="text-xl font-bold text-neutral-800 tracking-tight mt-4">{currentUser.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{currentUser.email}</p>

              {/* Badges and statistics details */}
              <div className="grid grid-cols-2 gap-3 mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100/50">
                <div className="text-center border-r border-neutral-200">
                  <div className="text-lg font-bold text-neutral-800">{orders.length}</div>
                  <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Заказов</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-neutral-800">Бронзовый</div>
                  <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Статус</div>
                </div>
              </div>

              {/* Edit form */}
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="mt-5 pt-4 border-t border-dashed border-neutral-200 space-y-3 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Изменить Имя</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase">Инициал (Аватар)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-semibold py-2 rounded-lg transition"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Редактировать профиль
                  </button>
                  <button
                    onClick={triggerSignOut}
                    className="w-full bg-red-50/50 hover:bg-red-50 text-red-500 hover:text-red-600 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Выйти из аккаунта
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* HISTORIC ORDERS */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-xl text-neutral-800 tracking-tight flex items-center gap-2">
              <Package2 className="w-5 h-5 text-neutral-400" />
              История заказов
            </h3>

            {orders.length === 0 ? (
              <div className="bg-white border border-neutral-100 rounded-[32px] p-12 text-center text-neutral-400 shadow-sm">
                <Clipboard className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="font-semibold text-neutral-700">История пуста</p>
                <p className="text-xs text-neutral-400 mt-1">Оформите заказ в корзине, чтобы он появился здесь.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 border-b border-neutral-50">
                      <div>
                        <span className="text-xs font-semibold text-neutral-400">КОД: #{String(o.id).slice(-8).toUpperCase()}</span>
                        <div className="text-xs text-neutral-500 font-medium mt-0.5">Дата заказа: {o.date}</div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${
                        o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {o.status === 'delivered' ? 'Доставлен' : 'В обработке'}
                      </span>
                    </div>

                    {/* Order items nested list */}
                    <div className="space-y-2 mb-3">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-neutral-700">
                            <Tag className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="font-medium line-clamp-1">{item.title}</span>
                          </div>
                          <span className="text-neutral-500 font-semibold text-right whitespace-nowrap px-1">
                            {item.qty} шт. × {item.price.toLocaleString()} ₽
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-neutral-50/50">
                      <span className="text-xs font-medium text-neutral-400">Итоговая стоимость</span>
                      <span className="text-base font-bold text-neutral-900">{o.total.toLocaleString()} ₽</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
