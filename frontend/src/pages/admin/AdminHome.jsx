import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, GraduationCap, Calendar, Clock } from 'lucide-react';

export default function AdminHome() {
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalTeachers: 0,
    todaySchedules: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    api.get('/admin/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error fetching admin stats:', err));
  }, []);

  const statCards = [
    { title: 'Total Siswa Aktif', value: stats.activeStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Guru', value: stats.totalTeachers, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Jadwal Hari Ini', value: stats.todaySchedules, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Pending Approval', value: stats.pendingApprovals, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboard Super Admin</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Ringkasan aktivitas dan metrik sistem musik ERP.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
