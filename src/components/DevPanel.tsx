import { useState, useEffect } from 'react';
import { db, SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase';
import { Database, Copy, Check, Server, RefreshCw, Layers, Terminal } from 'lucide-react';

interface DevPanelProps {
  onDatabaseAction: () => void;
}

export default function DevPanel({ onDatabaseAction }: DevPanelProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string }>({
    success: false,
    message: 'База данных работает в оффлайн-режиме (LocalStorage).',
  });
  const [expanded, setExpanded] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    const result = await db.testConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const seedData = async () => {
    setChecking(true);
    const ok = await db.seedProducts();
    if (ok) {
      setStatus({
        success: true,
        message: 'Продукты успешно посеяны в Supabase! Обновите каталог.',
      });
      onDatabaseAction();
    } else {
      setStatus({
        success: false,
        message: 'Не удалось посеять продукты. Убедитесь, что таблицы созданы в Supabase и RLS настроены.',
      });
    }
    setChecking(false);
  };

  return (
    <div className="bg-neutral-900 text-neutral-100 rounded-3xl p-6 border border-neutral-800 shadow-2xl overflow-hidden font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${status.success ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide uppercase text-neutral-400">Панель интеграции Supabase</h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Статус: {status.success ? (
                <span className="text-emerald-400 font-medium">Подключено к Supabase ✅</span>
              ) : (
                <span className="text-amber-400 font-medium">Локальная симуляция (LocalStorage) ⚠️</span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl font-medium transition cursor-pointer text-white"
        >
          {expanded ? 'Скрыть панель' : 'Развернуть SQL/Инструкции'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-neutral-950 rounded-2xl flex items-start gap-2.5 text-xs text-neutral-300 border border-neutral-800">
        <Server className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="leading-relaxed">{status.message}</p>
          {!isSupabaseConfigured() && (
            <p className="mt-2 text-neutral-400 text-[11px] leading-relaxed">
              💡 Чтобы подключить настоящую БД Supabase, укажите переменные <code className="bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-strawberry-400 text-[10px]">VITE_SUPABASE_URL</code> и <code className="bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-strawberry-400 text-[10px]">VITE_SUPABASE_ANON_KEY</code> в вашем <code className="bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-[10px]">.env</code> файле.
            </p>
          )}
        </div>
        <button
          onClick={checkConnection}
          disabled={checking}
          className="p-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
          Тест
        </button>
      </div>

      {expanded && (
        <div className="mt-6 border-t border-neutral-800 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-500" />
              SQL-скрипт для вашего диплома
            </h4>
            <div className="flex gap-2">
              {isSupabaseConfigured() && (
                <button
                  onClick={seedData}
                  disabled={checking}
                  className="bg-sky-950 hover:bg-sky-900 text-sky-300 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer border border-sky-800 transition"
                  title="Записать базовые гитары в таблицы Supabase"
                >
                  <Layers className="w-3 h-3" />
                  Заполнить БД товарами
                </button>
              )}
              <button
                onClick={handleCopy}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition border border-neutral-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Скопировано!' : 'Копировать SQL'}
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Скопируйте скрипт ниже, перейдите в веб-консоль <strong>Supabase → SQL Editor → New query</strong>, вставьте и нажмите <strong>Run</strong>. Это мгновенно создаст все необходимые таблицы со связями и политиками безопасности (RLS) для вашего проекта.
          </p>

          <div className="relative bg-neutral-950 rounded-2xl p-4 border border-neutral-800 text-[11px] font-mono overflow-x-auto max-h-60 text-neutral-300 scrollbar-thin scrollbar-thumb-neutral-800">
            <pre className="whitespace-pre">{SQL_SCHEMA}</pre>
          </div>
          
          <div className="bg-neutral-950/50 p-4 rounded-2xl text-xs text-neutral-400 leading-relaxed space-y-2 border border-neutral-800">
            <p className="font-semibold text-neutral-300">🎓 Как это работает в дипломе:</p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li><strong>Гибридный режим:</strong> Позволяет показывать проект комиссии из любой точки. Если интернет пропадет, localStorage-сеть продолжит работу.</li>
              <li><strong>Row Level Security (RLS):</strong> Включены политики, запрещающие пользователям изменять чужие корзины и заказы.</li>
              <li><strong>Реальные связи:</strong> Таблицы заказов и корзины ссылаются на базовые аккаунты Supabase Auth.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
