import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function TeacherHome() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/teacher/schedules');
      setSchedules(res.data);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="card" rows={3} />;
  }

  if (error) {
    return <ErrorState onRetry={fetchSchedules} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Jadwal Mengajar</h1>
          <p className="text-amber-100">Berikut adalah daftar kelas yang Anda ampu.</p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState title="Belum Ada Jadwal" description="Anda belum memiliki jadwal mengajar." />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div 
              key={schedule.id} 
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white line-clamp-1">
                    {schedule.course.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400 shrink-0">
                    {schedule.day}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-amber-500" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-amber-500" />
                    <span>{schedule.classroom.name} (Kapasitas: {schedule.classroom.capacity})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-amber-500" />
                    <span>{schedule.enrollments?.length || 0} Siswa Terdaftar</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl">
                <Button 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                  onClick={() => navigate(`/teacher/schedules/${schedule.id}`)}
                >
                  Kelola Kelas Ini
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
