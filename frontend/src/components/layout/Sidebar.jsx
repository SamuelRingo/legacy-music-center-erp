import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, User as UserIcon, 
  Home, Users, Music, Building, Contact, 
  Calendar, Receipt, FileText, CheckSquare, Image as ImageIcon,
  GraduationCap, DollarSign, Palette, Settings, Clipboard, CreditCard, ChevronDown
} from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

export default function Sidebar({ user, isMobileOpen, isDesktopCollapsed, setIsMobileOpen, handleLogout }) {
  const location = useLocation();
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    if (user?.role) {
      const storageKey = `sidebar_categories_${user.role.toLowerCase()}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setOpenCategories(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse sidebar categories", e);
        }
      }
    }
  }, [user?.role]);

  const toggleCategory = (categoryId) => {
    setOpenCategories(prev => {
      const newState = { ...prev, [categoryId]: !prev[categoryId] };
      if (user?.role) {
        const storageKey = `sidebar_categories_${user.role.toLowerCase()}`;
        localStorage.setItem(storageKey, JSON.stringify(newState));
      }
      return newState;
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'STAFF': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'TEACHER': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getSidebarLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard Utama', href: '/admin', icon: Home, type: 'link' },
          {
            label: 'Akademik',
            icon: GraduationCap,
            type: 'category',
            id: 'akademik',
            items: [
              { label: 'Approval Pendaftaran', href: '/staff/approvals' },
              { label: 'Jadwal & Kelas', href: '/staff/schedules' },
              { label: 'Manajement Akun', href: '/admin/users' },
              { label: 'Kursus Musik', href: '/admin/courses' },
              { label: 'Ruang Kelas', href: '/admin/classrooms' },
            ]
          },
          {
            label: 'Keuangan',
            icon: DollarSign,
            type: 'category',
            id: 'keuangan',
            items: [
              { label: 'Tagihan & Pembayaran', href: '/staff/invoices' },
              { label: 'Transaksi Kas', href: '/staff/finance' },
              { label: 'Laporan Keuangan', href: '/staff/reports' },
            ]
          },
          {
            label: 'Inventaris',
            icon: Clipboard,
            type: 'category',
            id: 'inventaris',
            items: [
              { label: 'Manajemen Barang', href: '/staff/inventory' },
            ]
          },
          {
            label: 'Manajemen Konten',
            icon: Palette,
            type: 'category',
            id: 'cms',
            items: [
              { label: 'Konten Landing Page', href: '/staff/landing-cms' },
              { label: 'Event Post', href: '/staff/events' },
            ]
          },
          {
            label: 'Pengaturan',
            icon: Settings,
            type: 'category',
            id: 'pengaturan',
            items: [
              { label: 'Profil Saya', href: '/staff/profile' },
            ]
          }
        ];
      case 'STAFF':
        return [
          { label: 'Dashboard Utama', href: '/staff', icon: Home, type: 'link' },
          {
            label: 'Akademik',
            icon: GraduationCap,
            type: 'category',
            id: 'akademik',
            items: [
              { label: 'Approval Pendaftaran', href: '/staff/approvals' },
              { label: 'Jadwal & Kelas', href: '/staff/schedules' },
            ]
          },
          {
            label: 'Keuangan',
            icon: DollarSign,
            type: 'category',
            id: 'keuangan',
            items: [
              { label: 'Tagihan & Pembayaran', href: '/staff/invoices' },
              { label: 'Transaksi Kas', href: '/staff/finance' },
              { label: 'Laporan Keuangan', href: '/staff/reports' },
            ]
          },
          {
            label: 'Inventaris',
            icon: Clipboard,
            type: 'category',
            id: 'inventaris',
            items: [
              { label: 'Manajemen Barang', href: '/staff/inventory' },
            ]
          },
          {
            label: 'Manajemen Konten',
            icon: Palette,
            type: 'category',
            id: 'cms',
            items: [
              { label: 'Konten Landing Page', href: '/staff/landing-cms' },
              { label: 'Event Post', href: '/staff/events' },
            ]
          },
          {
            label: 'Pengaturan',
            icon: Settings,
            type: 'category',
            id: 'pengaturan',
            items: [
              { label: 'Profil Saya', href: '/staff/profile' },
            ]
          }
        ];
      case 'TEACHER':
        return [
          { label: 'Jadwal Mengajar', href: '/teacher', icon: Home, type: 'link' },
          { label: 'Profil Saya', href: '/teacher/profile', icon: UserIcon, type: 'link' },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', href: '/student', icon: Home, type: 'link' },
          { label: 'Tagihan Saya', href: '/student/invoices', icon: Receipt, type: 'link' },
          { label: 'Progress Belajar', href: '/student/progress', icon: CheckSquare, type: 'link' },
          { label: 'Profil Saya', href: '/student/profile', icon: UserIcon, type: 'link' },
        ];
      default:
        return [];
    }
  };

  const sidebarLinks = getSidebarLinks();

  return (
    <aside className={`
      fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
      transform transition-all duration-300 ease-in-out flex flex-col
      ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
      ${!isMobileOpen && isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
    `}>
      {/* Brand */}
      <div className={`h-20 flex items-center border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${isDesktopCollapsed ? 'justify-center px-0' : 'px-6 justify-between'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white dark:text-zinc-900 font-bold">L</span>
          </div>
          {!isDesktopCollapsed && (
            <span className="font-bold text-lg text-zinc-900 dark:text-white truncate">Legacy Musik</span>
          )}
        </div>
        <button 
          className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* User Info (Sidebar) */}
      <div className={`border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${isDesktopCollapsed ? 'p-4 flex justify-center' : 'p-6'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-300">
            <UserIcon size={20} />
          </div>
          {!isDesktopCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sidebarLinks.map((link, idx) => {
          // If it's a category
          if (link.type === 'category') {
            const Icon = link.icon;
            const isChildActive = link.items.some(item => location.pathname.startsWith(item.href));
            const isOpen = !!openCategories[link.id] || isChildActive;

            if (isDesktopCollapsed) {
              return (
                <div key={idx} className="mb-2">
                  <div className="group relative">
                    <div className="flex items-center justify-center py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                      <Icon size={20} />
                    </div>
                    <div className="absolute left-full top-0 ml-2 hidden w-48 rounded-md bg-white dark:bg-zinc-800 p-2 shadow-lg group-hover:block z-50">
                      <p className="px-3 text-xs font-semibold text-zinc-500 mb-2 uppercase">{link.label}</p>
                      {link.items.map((item, i) => (
                        <NavLink
                          key={i}
                          to={item.href}
                          className={({ isActive }) => `
                            block px-3 py-2 text-sm rounded-md transition-colors
                            ${isActive ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}
                          `}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                  {idx < sidebarLinks.length - 1 && (
                    <hr className="my-2 border-zinc-200 dark:border-zinc-800 mx-4" />
                  )}
                </div>
              );
            }

            return (
              <div key={idx} className="mb-1">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleCategory(link.id)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center justify-between w-full px-3 py-2 outline-none group">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1 overflow-hidden transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in">
                    {link.items.map((item, i) => (
                      <NavLink
                        key={i}
                        to={item.href}
                        className={({ isActive }) => `
                          block mx-2 pl-9 pr-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold' 
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                        `}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
                {idx < sidebarLinks.length - 1 && (
                  <hr className="my-2 border-zinc-200 dark:border-zinc-800 mx-2" />
                )}
              </div>
            );
          }

          // If it's a simple link
          if (link.type === 'link') {
            const Icon = link.icon;
            
            if (isDesktopCollapsed) {
              return (
                <div key={idx} className="mb-2">
                  <NavLink
                    to={link.href}
                    end={link.href.split('/').length <= 2}
                    title={link.label}
                    className={({ isActive }) => `
                      flex items-center justify-center py-2 rounded-xl text-sm font-medium transition-colors mx-2
                      ${isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}
                    `}
                  >
                    <Icon size={20} className="shrink-0" />
                  </NavLink>
                  {idx < sidebarLinks.length - 1 && (
                    <hr className="my-2 border-zinc-200 dark:border-zinc-800 mx-4" />
                  )}
                </div>
              );
            }

            return (
              <div key={idx} className="mb-1">
                <NavLink
                  to={link.href}
                  end={link.href.split('/').length <= 2}
                  className={({ isActive }) => `
                    flex items-center gap-2 py-2 px-3 mx-2 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold' 
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
                {idx < sidebarLinks.length - 1 && (
                  <hr className="my-2 border-zinc-200 dark:border-zinc-800 mx-2" />
                )}
              </div>
            );
          }
          
          return null;
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={handleLogout}
          title={isDesktopCollapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors
            ${isDesktopCollapsed ? 'justify-center px-0' : 'px-3'}
          `}
        >
          <LogOut size={20} className="shrink-0" />
          {!isDesktopCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
