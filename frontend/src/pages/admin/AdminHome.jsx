import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useDashboardCache } from '../../context/DashboardContext';
import { Users, GraduationCap, Calendar, Clock } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';

export default function AdminHome() {
  const { getCachedData, setCachedData } = useDashboardCache();
  
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalTeachers: 0,
    todaySchedules: 0,
    pendingApprovals: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = () => {
    const cached = getCachedData('admin');
    if (cached) {
      setStats(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    api.get('/admin/dashboard-stats')
      .then(res => {
        setStats(res.data);
        setCachedData('admin', res.data);
      })
      .catch(err => {
        console.error('Error fetching admin stats:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
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

      {loading ? (
        <LoadingSkeleton type="card" rows={4} />
      ) : error ? (
        <ErrorState onRetry={fetchStats} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <MetricCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              colorClass={stat.color}
              bgClass={stat.bg}
            />
          ))}
        </div>
      )}
    </div>
  );
}
