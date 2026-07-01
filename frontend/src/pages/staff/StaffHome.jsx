import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Users, Calendar, Receipt } from 'lucide-react';

export default function StaffHome() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    todaySchedules: 0,
    unpaidInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/staff/dashboard-stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Pendaftaran Menunggu',
      value: stats.pendingCount,
      icon: Users,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      title: 'Jadwal Kelas Hari Ini',
      value: stats.todaySchedules,
      icon: Calendar,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Tagihan Belum Lunas',
      value: stats.unpaidInvoices,
      icon: Receipt,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Staff</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Selamat datang kembali! Berikut ringkasan operasional hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.title}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{card.value}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
