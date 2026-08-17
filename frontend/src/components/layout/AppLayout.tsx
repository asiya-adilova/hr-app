import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';

export function AppLayout() {
  const location = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === location.pathname;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuPath(null);
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar className="hidden lg:flex" />

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Закрыть меню"
            onClick={closeMenu}
          />
          <Sidebar className="relative z-50 h-full shadow-xl" onNavigate={closeMenu} />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMenuPath(location.pathname)} />
        <main className="flex-1 p-4 pb-8 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
