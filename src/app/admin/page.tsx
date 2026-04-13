"use client";

import React, { useEffect, useMemo, useState } from 'react';

type AppConfig = {
  phone: string;
  phoneHref: string;
  whatsappPhone: string;
  whatsappText: string;
  telegramChatId?: string;
  telegramChatTitle?: string;
  telegramChatType?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [config, setConfig] = useState<AppConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [busyItems, setBusyItems] = useState<Record<string, boolean>>({});

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(5000);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const hasData = useMemo(() => config !== null, [config]);

  const loadAll = async () => {
    const [cfg, prods] = await Promise.all([
      api<AppConfig>('/api/admin/config'),
      api<Product[]>('/api/admin/products'),
    ]);
    setConfig(cfg);
    setProducts(prods);
  };

  useEffect(() => {
    loadAll()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      setAuthed(true);
      await loadAll();
      setPassword('');
    } catch (err) {
      setAuthed(false);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>('/api/admin/logout', { method: 'POST' });
      setAuthed(false);
      setConfig(null);
      setProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setBusy(false);
    }
  };

  const saveConfig = async (patch: Partial<AppConfig>) => {
    if (!config) return;
    setBusy(true);
    setError(null);
    try {
      const next = await api<AppConfig>('/api/admin/config', { method: 'PUT', body: JSON.stringify(patch) });
      setConfig(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageFile) {
      setError('Пожалуйста, выберите изображение товара.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', newName.trim());
      formData.append('price', String(newPrice));
      formData.append('image', newImageFile);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(data.error || 'Create failed');
      }

      const created = await res.json() as Product;
      setProducts(prev => [created, ...prev]);
      setNewName('');
      setNewImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('new-product-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const updateProduct = async (id: string, name: string, price: number, imageFile?: File | null) => {
    setBusyItems(prev => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', name.trim());
      formData.append('price', String(price));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Update failed' }));
        throw new Error(data.error || 'Update failed');
      }

      const updated = await res.json() as Product;
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyItems(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteProduct = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      await api<{ ok: boolean }>('/api/admin/products', { method: 'DELETE', body: JSON.stringify({ id }) });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-3xl font-extrabold">Админ-панель</h1>
          {authed ? (
            <button
              onClick={onLogout}
              disabled={busy}
              className="rounded-xl px-4 py-2 font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              Выйти
            </button>
          ) : null}
        </div>

        {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">{error}</div> : null}

        {!authed ? (
          <form onSubmit={onLogin} className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Вход</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль админа"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={busy || !password}
                className="rounded-xl px-5 py-3 font-bold bg-primary text-dark hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                Войти
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">Пароль берётся из переменной окружения `ADMIN_PASSWORD`.</p>
          </form>
        ) : (
          <>
            <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Контакты</h2>
              {!hasData ? (
                <div className="text-gray-500">Загрузка…</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-700">Телефон (текст)</span>
                    <input
                      value={config?.phone ?? ''}
                      onChange={e => setConfig(prev => (prev ? { ...prev, phone: e.target.value } : prev))}
                      className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-700">Телефон (href)</span>
                    <input
                      value={config?.phoneHref ?? ''}
                      onChange={e => setConfig(prev => (prev ? { ...prev, phoneHref: e.target.value } : prev))}
                      className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-700">WhatsApp (текст)</span>
                    <input
                      value={config?.whatsappPhone ?? ''}
                      onChange={e => setConfig(prev => (prev ? { ...prev, whatsappPhone: e.target.value } : prev))}
                      className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-gray-700">WhatsApp (текст сообщения)</span>
                    <textarea
                      value={config?.whatsappText ?? ''}
                      onChange={e => setConfig(prev => (prev ? { ...prev, whatsappText: e.target.value } : prev))}
                      rows={4}
                      className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </label>
                </div>
              )}

              <div className="mt-5">
                <button
                  disabled={busy || !config}
                  onClick={() => config && saveConfig(config)}
                  className="rounded-xl px-5 py-3 font-bold bg-primary text-dark hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                >
                  Сохранить контакты
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-gray-700">Telegram подключение</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {config?.telegramChatId ? (
                        <>
                          Подключено: <span className="font-semibold">{config.telegramChatTitle ?? config.telegramChatId}</span>{" "}
                          <span className="text-gray-400">({config.telegramChatType ?? "chat"})</span>
                        </>
                      ) : (
                        <>Не подключено</>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Добавьте бота в чат и отправьте команду <span className="font-mono">/connect</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-6">
                <h2 className="text-xl font-bold">Товары</h2>
                <button
                  disabled={busy}
                  onClick={() => loadAll().catch(() => null)}
                  className="rounded-xl px-4 py-2 font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  Обновить
                </button>
              </div>

              <form onSubmit={createProduct} className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Название"
                  className="md:col-span-2 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(Number(e.target.value))}
                  placeholder="Цена"
                  className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex flex-col gap-1">
                  <input
                    id="new-product-image"
                    type="file"
                    accept="image/*"
                    onChange={e => setNewImageFile(e.target.files?.[0] || null)}
                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-dark hover:file:bg-gray-200"
                  />
                  {newImageFile && <span className="text-[10px] text-green-600 px-2 truncate">Выбрано: {newImageFile.name}</span>}
                </div>
                <button
                  type="submit"
                  disabled={busy || !newName.trim() || !newImageFile}
                  className="md:col-span-4 rounded-xl px-5 py-3 font-bold bg-dark text-white hover:bg-black disabled:opacity-50"
                >
                  Добавить товар
                </button>
              </form>

              <div className="mt-7 space-y-3">
                {products.map(p => (
                  <div key={p.id} className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-10 gap-3 w-full">
                        <input
                          className="md:col-span-4 rounded-xl border border-gray-300 px-3 py-2 bg-white"
                          value={p.name}
                          onChange={e => setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                        />
                        <input
                          type="number"
                          className="md:col-span-2 rounded-xl border border-gray-300 px-3 py-2 bg-white"
                          value={p.price}
                          onChange={e => setProducts(prev => prev.map(x => (x.id === p.id ? { ...x, price: Number(e.target.value) } : x)))}
                        />
                        <div className="md:col-span-4 flex flex-col gap-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // We store temporary file link to local object and only upload when "Ok" is clicked
                                // But to simplify, let's just use updateProduct as soon as it's changed or add an "Update" button
                                // For simplicity here, we'll keep the "Ok" button logic
                                (p as any)._newFile = file;
                                setProducts([...products]);
                              }
                            }}
                            className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-200 file:text-dark"
                          />
                          {(p as any)._newFile && <span className="text-[10px] text-green-600 px-1 truncate">Новое: {(p as any)._newFile.name}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          disabled={busy || busyItems[p.id]}
                          onClick={() => updateProduct(p.id, p.name, p.price, (p as any)._newFile)}
                          className="flex-1 rounded-xl px-4 py-2 font-bold bg-primary text-dark hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
                        >
                          Ок
                        </button>
                        <button
                          disabled={busy || busyItems[p.id]}
                          onClick={() => deleteProduct(p.id)}
                          className="flex-1 rounded-xl px-4 py-2 font-bold bg-white border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 ? <div className="text-gray-500 mt-4">Пока нет товаров.</div> : null}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

