import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useDashboardQuery } from '../../context/DashboardContext';
import { Users, Calendar, Receipt } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';

export default function StaffHome() {
  const fetchStaffStats = useCallback(async () => {
    const res = await api.get('/staff/dashboard-stats');
    return res.data;
  }, []);

  const { data: stats, loading, error, refetch } = useDashboardQuery('staff', fetchStaffStats);

  const safeStats = stats || {
    pendingCount: 0,
    todaySchedules: 0,
    unpaidInvoices: 0
  };

  const statCards = [
    {
      title: 'Pendaftaran Menunggu',
      value: safeStats.pendingCount,
      icon: Users,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      title: 'Jadwal Kelas Hari Ini',
      value: safeStats.todaySchedules,
      icon: Calendar,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Tagihan Belum Lunas',
      value: safeStats.unpaidInvoices,
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
        <ErrorState onRetry={refetch} />
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
