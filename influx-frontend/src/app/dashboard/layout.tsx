'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, User, LogOut, Bell, MessageSquare, Briefcase, Zap, PlusSquare, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!mounted || !isHydrated) return null;
  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', href: '/dashboard/discover', icon: Search },
    { name: 'Promote', href: '/dashboard/promote', icon: Zap },
    ...(user?.role === 'BRAND' ? [{ name: 'My Campaigns', href: '/dashboard/campaigns', icon: PlusSquare }] : []),
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Connections', href: '/dashboard/connections', icon: Briefcase },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between"
      >
        <div>
          <div className="h-20 flex items-center px-8 border-b border-white/10">
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 tracking-tighter">
              INFLUX
            </h1>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-300 cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-gray-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-bold capitalize">
            {pathname.split('/').pop() === 'dashboard' ? 'Overview' : pathname.split('/').pop()?.replace('-', ' ')}
          </h2>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-purple-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search influencers, brands, niches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:bg-white/10 transition-all placeholder:text-gray-500 text-sm font-medium"
            />
          </form>
          
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-400 hover:text-white transition">
              <Bell size={24} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-pink-500 rounded-full animate-ping" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-pink-500 rounded-full" />
            </button>
            <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="font-medium text-sm">@{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {/* Subtle gradient orb behind content */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 h-full">
             <AnimatePresence mode="wait">
               <motion.div
                 key={pathname}
                 initial={{ opacity: 0, y: 15 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -15 }}
                 transition={{ duration: 0.3, ease: "easeOut" }}
                 className="h-full"
               >
                 {children}
               </motion.div>
             </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
