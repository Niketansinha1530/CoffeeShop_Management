import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineCube,
  HiX,
} from 'react-icons/hi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { path: '/customers', label: 'Customers', icon: HiOutlineUsers },
  { path: '/products', label: 'Products', icon: HiOutlineCube },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Close drawer on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const SidebarContent = () => (
    <aside className="w-[260px] h-full bg-dark-950 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-xl shadow-glow">
            ☕
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">BrewDash</h1>
            <p className="text-[11px] text-dark-400 font-medium tracking-wider uppercase">Coffee Management</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold text-dark-500 uppercase tracking-[0.15em]">
          Main Menu
        </p>
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-coffee-500/20 to-coffee-600/10 text-coffee-400'
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-coffee-500/20 text-coffee-400'
                    : 'text-dark-500 group-hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-coffee-400 animate-pulse-slow" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-[11px] text-dark-500">admin@brewdash.com</p>
          </div>
          {/* Online indicator */}
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ─── Desktop: always-visible sidebar ─── */}
      <div className="hidden lg:flex shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* ─── Mobile: overlay drawer ─── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative drawer-enter h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
