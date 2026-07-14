import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useDashboardQuery } from '../../context/DashboardContext';
import { Users, Calendar, Receipt } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import EmptyState from '../../components/shared/EmptyState';
import { CalendarDays } from 'lucide-react';

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

  
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingWidgets, setLoadingWidgets] = useState(true);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const [schedRes, eventRes] = await Promise.all([
          api.get('/staff/schedules'),
          api.get('/public/events')
        ]);
        
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const todayName = days[new Date().getDay()];
        
        const todayScheds = schedRes.data.filter(s => s.day === todayName);
        setSchedules(todayScheds.slice(0, 5));
        
        setEvents(eventRes.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch dashboard widgets", err);
      } finally {
        setLoadingWidgets(false);
      }
    };
    fetchWidgets();
  }, []);

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
        <>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          {/* Kelas Hari Ini Widget */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Kelas Hari Ini
              </CardTitle>
              <CardDescription>Jadwal kelas musik yang berlangsung hari ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingWidgets ? (
                <div className="p-6"><LoadingSkeleton type="list" rows={3} /></div>
              ) : schedules.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={Calendar} title="Tidak ada kelas" description="Belum ada jadwal kelas untuk hari ini." />
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {schedules.map(sch => (
                    <div key={sch.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm text-zinc-900 dark:text-white">{sch.course?.name || 'Kelas'}</p>
                        <p className="text-xs text-zinc-500">{sch.teacher?.name || 'Guru'} &bull; {sch.room?.name || 'Ruangan'}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-md font-medium">
                          {sch.startTime} - {sch.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Terbaru Widget */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gold-500" />
                Event Terbaru
              </CardTitle>
              <CardDescription>Event dan kegiatan mendatang dari CMS.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingWidgets ? (
                <div className="p-6"><LoadingSkeleton type="list" rows={3} /></div>
              ) : events.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={CalendarDays} title="Belum ada event" description="Belum ada event terbaru yang dipublikasikan." />
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {events.map(ev => (
                    <div key={ev.id} className="p-4 flex gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden">
                        {ev.imageUrl ? (
                          <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><CalendarDays className="h-5 w-5 text-zinc-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">{ev.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </>
      )}
    </div>
  );
}
