import { HiMenu } from 'react-icons/hi';

export default function MobileHeader({ onMenuOpen }) {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 bg-dark-950/95 backdrop-blur-md border-b border-white/5">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-base shadow-glow">
          ☕
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight leading-none">BrewDash</h1>
          <p className="text-[10px] text-dark-400 tracking-wider uppercase font-medium">Management</p>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Live indicator */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coffee-500 border-2 border-dark-950" />
          </button>
        </div>

        {/* Hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={onMenuOpen}
          className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
        >
          <HiMenu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
