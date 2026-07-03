import { NavLink } from 'react-router-dom';
import { 
  Menu, X, LogOut, User as UserIcon, 
  Home, Users, Music, Building, Contact, 
  Calendar, Receipt, FileText, CheckSquare, Image as ImageIcon
} from 'lucide-react';

export default function Sidebar({ user, isMobileOpen, isDesktopCollapsed, setIsMobileOpen, handleLogout }) {
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
          { label: 'Admin', type: 'heading' },
          { label: 'Dashboard', href: '/admin', icon: Home },
          { label: 'Manajemen Pengguna', href: '/admin/users', icon: Users },
          { label: 'Kursus Musik', href: '/admin/courses', icon: Music },
          { label: 'Ruang Kelas', href: '/admin/classrooms', icon: Building },
          
          { label: 'Panel Staff', type: 'heading' },
          { label: 'Approval Pendaftaran', href: '/staff/approvals', icon: Users },
          { label: 'Jadwal & Kelas', href: '/staff/schedules', icon: Calendar },
          { label: 'Tagihan & Pembayaran', href: '/staff/invoices', icon: Receipt },
          { label: 'Laporan', href: '/staff/reports', icon: FileText },
          { label: 'CMS Event Banner', href: '/staff/events', icon: ImageIcon },
          { label: 'Konten Landing Page', href: '/staff/landing-cms', icon: ImageIcon },
        ];
      case 'STAFF':
        return [
          { label: 'Dashboard', href: '/staff', icon: Home },
          { label: 'Persetujuan Siswa', href: '/staff/approvals', icon: Users },
          { label: 'Jadwal & Kelas', href: '/staff/schedules', icon: Calendar },
          { label: 'Tagihan & Pembayaran', href: '/staff/invoices', icon: Receipt },
          { label: 'Laporan', href: '/staff/reports', icon: FileText },
          { label: 'CMS Event Banner', href: '/staff/events', icon: ImageIcon },
          { label: 'Konten Landing Page', href: '/staff/landing-cms', icon: ImageIcon },
          { label: 'Profil Saya', href: '/staff/profile', icon: UserIcon },
        ];
      case 'TEACHER':
        return [
          { label: 'Jadwal Mengajar', href: '/teacher', icon: Home },
          { label: 'Profil Saya', href: '/teacher/profile', icon: UserIcon },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', href: '/student', icon: Home },
          { label: 'Tagihan Saya', href: '/student/invoices', icon: Receipt },
          { label: 'Progress Belajar', href: '/student/progress', icon: CheckSquare },
          { label: 'Profil Saya', href: '/student/profile', icon: UserIcon },
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
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sidebarLinks.map((link, idx) => {
          if (link.type === 'heading') {
            return (
              <div key={idx} className={`pt-4 pb-1 ${isDesktopCollapsed ? 'text-center' : 'px-3'}`}>
                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  {isDesktopCollapsed ? '•••' : link.label}
                </span>
              </div>
            );
          }

          const Icon = link.icon;
          return (
            <NavLink
              key={idx}
              to={link.href}
              end={link.href.split('/').length <= 2}
              title={isDesktopCollapsed ? link.label : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isDesktopCollapsed ? 'justify-center px-0' : 'px-3'}
                ${isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'}
              `}
            >
              <Icon size={20} className="shrink-0" />
              {!isDesktopCollapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
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
