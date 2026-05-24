import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Products from './pages/Products';
import {
  HiOutlineViewGrid,
  HiViewGrid,
  HiOutlineClipboardList,
  HiClipboardList,
  HiOutlineUsers,
  HiUsers,
  HiOutlineCube,
  HiCube,
} from 'react-icons/hi';

const bottomNavItems = [
  { path: '/dashboard', label: 'Dashboard', Icon: HiOutlineViewGrid, ActiveIcon: HiViewGrid },
  { path: '/orders', label: 'Orders', Icon: HiOutlineClipboardList, ActiveIcon: HiClipboardList },
  { path: '/customers', label: 'Customers', Icon: HiOutlineUsers, ActiveIcon: HiUsers },
  { path: '/products', label: 'Products', Icon: HiOutlineCube, ActiveIcon: HiCube },
];

function BottomNav() {
  const location = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-md border-t border-white/5 pb-safe">
      <div className="flex items-stretch h-[58px]">
        {bottomNavItems.map(({ path, label, Icon, ActiveIcon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="bottom-nav-item"
            >
              {isActive ? (
                <ActiveIcon className="w-5 h-5 text-coffee-400" />
              ) : (
                <Icon className="w-5 h-5 text-dark-500" />
              )}
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-coffee-400' : 'text-dark-500'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-coffee-400" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile sticky header */}
        <MobileHeader onMenuOpen={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto has-bottom-nav">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/products" element={<Products />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </Router>
  );
}

export default App;
