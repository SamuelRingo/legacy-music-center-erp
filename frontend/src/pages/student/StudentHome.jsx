import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { BookOpen, Calendar, Clock, MapPin, Receipt, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentHome() {
  const [data, setData] = useState({ enrollments: [], user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Kamu belum terdaftar di kelas manapun.</p>
            </div>
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
