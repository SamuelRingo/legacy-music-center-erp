import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useDashboardCache } from '../../context/DashboardContext';
import { BookOpen, Calendar, Clock, MapPin, Receipt, CheckCircle } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function StudentHome() {
  const { getCachedData, setCachedData } = useDashboardCache();
  const [data, setData] = useState({ enrollments: [], user: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    const cached = getCachedData('student', 60000); // 1 menit cache
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
      setCachedData('student', res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" rows={1} />
        <LoadingSkeleton type="card" rows={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchData} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Halo, {data.user?.name}! 👋</h1>
          <p className="text-zinc-300">Selamat datang di dashboard siswa. Mari mulai belajar musik hari ini!</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Classes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
            <BookOpen className="text-zinc-500" />
            Kelas Saya
          </h2>
          
          {data.enrollments.length === 0 ? (
            <EmptyState title="Belum Ada Kelas" description="Kamu belum terdaftar di kelas manapun." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.enrollments.map((enr) => (
                <div key={enr.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4">
                    {enr.schedule.course.name}
                  </h3>
                  <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-zinc-400" />
                      <span>{enr.schedule.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-zinc-400" />
                      <span>{enr.schedule.startTime} - {enr.schedule.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-zinc-400" />
                      <span>{enr.schedule.classroom.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Stats / Quick Links */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
            <Receipt className="text-zinc-500" />
            Informasi
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Status Pendaftaran</p>
            <p className="font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle size={18} /> Aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
