import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useDashboardQuery } from '../../context/DashboardContext';
import { Users, GraduationCap, Calendar, Clock } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import EmptyState from '../../components/shared/EmptyState';
import { CalendarDays } from 'lucide-react';

export default function AdminHome() {
  const fetchAdminStats = useCallback(async () => {
    const res = await api.get('/admin/dashboard-stats');
    return res.data;
  }, []);

  const { data: stats, loading, error, refetch } = useDashboardQuery('admin', fetchAdminStats);

  // Nilai default jika masih loading pertama kali
  const safeStats = stats || {
    activeStudents: 0,
    totalTeachers: 0,
    todaySchedules: 0,
    pendingApprovals: 0
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
    { title: 'Total Siswa Aktif', value: safeStats.activeStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Total Guru', value: safeStats.totalTeachers, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { title: 'Jadwal Hari Ini', value: safeStats.todaySchedules, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { title: 'Pending Approval', value: safeStats.pendingApprovals, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
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
        <ErrorState onRetry={refetch} />
      ) : (
        <>
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
