import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useDashboardCache } from '../../context/DashboardContext';
import { Users, Calendar, Receipt } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';

export default function StaffHome() {
  const { getCachedData, setCachedData } = useDashboardCache();
  
  const [stats, setStats] = useState({
    pendingCount: 0,
    todaySchedules: 0,
    unpaidInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = async () => {
    const cached = getCachedData('staff');
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/staff/dashboard-stats');
      setStats(res.data);
      setCachedData('staff', res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      {loading ? (
        <LoadingSkeleton type="card" rows={3} />
      ) : error ? (
        <ErrorState onRetry={fetchStats} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <MetricCard
              key={idx}
              title={card.title}
              value={card.value}
              icon={card.icon}
              colorClass={card.color.split(' ')[0]}
              bgClass={card.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
