import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { useDashboardQuery } from '../../context/DashboardContext';
import { BookOpen, Calendar, Clock, MapPin, Receipt, CheckCircle, Award, GraduationCap } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function StudentHome() {
  const fetchStudentData = useCallback(async () => {
    const res = await api.get('/student/dashboard');
    return res.data;
  }, []);

  const { data, loading, error, refetch } = useDashboardQuery('student', fetchStudentData, 60000); // 1 menit cache

  const safeData = data || { enrollments: [], user: null, profile: {} };

  const getMonthName = (val) => {
    if (val === 1) return 'Repertoir';
    if (val === 2) return 'Ujian';
    if (val === 3) return 'Performance';
    return '-';
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" rows={1} />
        <LoadingSkeleton type="card" rows={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Halo, {safeData.user?.name}! 👋</h1>
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
          
          {safeData.enrollments.length === 0 ? (
            <EmptyState title="Belum Ada Kelas" description="Kamu belum terdaftar di kelas manapun." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {safeData.enrollments.map((enr) => (
                <div key={enr.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">

                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                      {enr.schedule.course.name}
                    </h3>
                    {(enr.gradeLevel || enr.currentMonth) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-500 text-sm font-medium">
                        <GraduationCap className="w-4 h-4" />
                        {enr.gradeLevel ? `Grade ${enr.gradeLevel}` : ''} 
                        {enr.gradeLevel && enr.currentMonth ? ' - ' : ''} 
                        {enr.currentMonth ? getMonthName(enr.currentMonth) : ''}
                      </span>
                    )}
                  </div>

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

          {/* Achievements */}
          <div className="mt-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white mb-4">
              <Award className="text-gold-500" />
              Prestasi Saya
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {!safeData.profile?.achievements || safeData.profile.achievements.length === 0 ? (
                <div className="text-center py-4 text-zinc-500">
                  <Award className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                  <p className="text-sm">Belum ada prestasi yang tercatat.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeData.profile.achievements.map((ach) => (
                    <div key={ach.id} className="flex gap-3 items-start border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center shrink-0 mt-1">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{ach.title}</h4>
                        <p className="text-xs text-zinc-500 mb-1">{new Date(ach.date).toLocaleDateString('id-ID')}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
