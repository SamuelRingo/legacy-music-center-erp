import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileBadge, CalendarPlus, Calendar as CalendarIcon, ArrowRight, Trash2, FileText, ArrowUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useDashboardCache } from '../../context/DashboardContext';
import { useCachedQuery, clearCache } from '../../lib/cache';

export default function ClassDetailPage({ readOnly = false }) {
  const { id: scheduleId } = useParams();
  const navigate = useNavigate();
  const { clearDashboardCache } = useDashboardCache();
  const [activeTab, setActiveTab] = useState('meetings'); // 'meetings' or 'students'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = terlama ke terbaru, 'desc' = terbaru ke terlama

  const fetchClassFn = useCallback(async () => {
    const [studentsRes, meetingsRes] = await Promise.all([
      api.get(`/teacher/schedules/${scheduleId}/students`),
      api.get(`/teacher/schedules/${scheduleId}/meetings`)
    ]);
    return {
      scheduleData: studentsRes.data.schedule,
      enrollments: studentsRes.data.enrollments,
      meetings: meetingsRes.data
    };
  }, [scheduleId]);

  const { data: classData, loading, error, refetch: fetchData } = useCachedQuery(`teacher_class_${scheduleId}`, fetchClassFn);
  const scheduleData = classData?.scheduleData || null;
  const enrollments = classData?.enrollments || [];
  const meetings = classData?.meetings || [];

  // New Meeting Modal
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  // Delete Meeting Dialog
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false);

  // Grade Modal
  const [gradeModal, setGradeModal] = useState({ open: false, enrollmentId: null, studentName: '' });
  const [gradeForm, setGradeForm] = useState({ score: '', evaluation: '' });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [editGradeConfirm, setEditGradeConfirm] = useState({ open: false, row: null, finalGrade: null });

  const createMeeting = async () => {
    setIsSubmittingMeeting(true);
    try {
      const res = await api.post(`/teacher/schedules/${scheduleId}/meetings`, {
        meetingDate: newMeetingDate
      });
      clearCache(`teacher_class_${scheduleId}`);
      toast.success('Pertemuan berhasil dibuat');
      setIsMeetingOpen(false);
      navigate(`/teacher/meetings/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat pertemuan');
      setIsSubmittingMeeting(false);
    }
  };

  const deleteMeeting = async () => {
    if (!meetingToDelete) return;
    setIsDeletingMeeting(true);
    try {
      await api.delete(`/teacher/meetings/${meetingToDelete.id}`);
      clearCache(`teacher_class_${scheduleId}`);
      toast.success('Pertemuan berhasil dihapus');
      setMeetingToDelete(null);
      fetchData(); // Refresh list
    } catch (error) {
      toast.error('Gagal menghapus pertemuan');
    } finally {
      setIsDeletingMeeting(false);
    }
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    setIsSubmittingGrade(true);
    try {
      await api.post('/teacher/grades', {
        enrollmentId: gradeModal.enrollmentId,
        score: parseInt(gradeForm.score),
        evaluation: gradeForm.evaluation
      });
      clearDashboardCache('teacher');
      clearCache(`teacher_class_${scheduleId}`);
      toast.success('Nilai akhir berhasil disimpan');
      setGradeModal({ open: false, enrollmentId: null, studentName: '' });
      setGradeForm({ score: '', evaluation: '' });
      fetchData(); // Refresh list to show updated grade
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleUpdateGrade = async (enrollmentId, field, value) => {
    try {
      await api.put(`/teacher/enrollments/${enrollmentId}/grade`, { [field]: parseInt(value) });
      clearCache(`teacher_class_${scheduleId}`);
      toast.success('Berhasil diperbarui');
      fetchData();
    } catch (error) {
      toast.error('Gagal memperbarui data siswa');
    }
  };

  const columns = [
    { 
      header: 'Nama Siswa', 
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.student?.user?.name}</span>
          <div className="flex items-center gap-2 mt-1">
            <Select 
              value={row.gradeLevel ? row.gradeLevel.toString() : ''} 
              onValueChange={(val) => handleUpdateGrade(row.id, 'gradeLevel', val)}
            >
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(g => (
                  <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={row.currentMonth ? row.currentMonth.toString() : ''} 
              onValueChange={(val) => handleUpdateGrade(row.id, 'currentMonth', val)}
            >
              <SelectTrigger className="h-7 w-32 text-xs">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (Repertoir)</SelectItem>
                <SelectItem value="2">2 (Ujian)</SelectItem>
                <SelectItem value="3">3 (Performance)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    { header: 'No. Telp (Wali)', cell: (row) => row.student?.parentPhone || '-' },
    { 
      header: 'Tanggal Daftar', 
      cell: (row) => new Date(row.enrolledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    },
    {
      header: 'Nilai Akhir',
      className: 'w-48 text-center',
      cell: (row) => {
        const finalGrade = row.finalGrades && row.finalGrades.length > 0 ? row.finalGrades[0] : null;
        return finalGrade ? (
          <div className="flex flex-col items-center">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{finalGrade.score}</span>
            <span className="text-[10px] text-zinc-400">Dinilai: {new Date(finalGrade.gradedAt).toLocaleDateString('id-ID')}</span>
          </div>
        ) : (
          <span className="text-zinc-400">-</span>
        );
      }
    },
    {
      header: 'Aksi',
      className: 'w-36 text-center',
      cell: (row) => {
        const finalGrade = row.finalGrades && row.finalGrades.length > 0 ? row.finalGrades[0] : null;
        if (finalGrade) {
          return (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 text-zinc-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditGradeConfirm({ open: true, row, finalGrade });
              }}
            >
              Edit Nilai
            </Button>
          );
        }
        return (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-zinc-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setGradeModal({ open: true, enrollmentId: row.id, studentName: row.student?.user?.name });
              setGradeForm({ score: '', evaluation: '' });
            }}
          >
            <FileBadge size={14} />
            Beri Nilai Akhir
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')} className="shrink-0">
          <ChevronLeft size={20} />
        </Button>
        <div className="flex-1">
          <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            <button onClick={() => navigate('/teacher')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Jadwal Mengajar
            </button>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-500">
              {scheduleData ? scheduleData.course.name : 'Detail Kelas'}
            </span>
          </nav>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Detail Kelas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {scheduleData ? `${scheduleData.day}, ${scheduleData.startTime} - ${scheduleData.endTime}` : 'Kelola pertemuan dan siswa.'}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="card" rows={4} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : (
        <div className="space-y-6">
          {/* Custom Tabs */}
          <div className="border-b border-zinc-200 dark:border-zinc-800">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab('meetings')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'meetings'
                    ? 'border-amber-500 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
              >
                Pertemuan
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-amber-500 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
                }`}
              >
                Anggota Kelas
              </button>
            </nav>
          </div>

          {/* Tab Contents */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Daftar Pertemuan</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="gap-2 text-zinc-600 dark:text-zinc-300"
                  >
                    <ArrowUpDown size={16} />
                    Sortir: {sortOrder === 'asc' ? 'Terlama' : 'Terbaru'}
                  </Button>
                  <Button 
                    onClick={() => setIsMeetingOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                  >
                    <CalendarPlus size={16} />
                    Buat Pertemuan
                  </Button>
                </div>
              </div>

              {meetings.length === 0 ? (
                <EmptyState title="Belum Ada Pertemuan" description="Belum ada pertemuan yang tercatat untuk kelas ini." />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {[...meetings].sort((a, b) => {
                    const dateA = new Date(a.meetingDate);
                    const dateB = new Date(b.meetingDate);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                  }).map((m) => (
                    <div 
                      key={m.id}
                      className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all group flex flex-col gap-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/teacher/meetings/${m.id}`)}
                        >
                          <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 transition-colors">
                            {m.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                            <CalendarIcon size={14} />
                            {new Date(m.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          
                          {/* Attendance summary badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400">
                              Hadir: {m.attendances?.filter(a => a.status === 'HADIR').length || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400">
                              Izin: {m.attendances?.filter(a => a.status === 'IZIN').length || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400">
                              Sakit: {m.attendances?.filter(a => a.status === 'SAKIT').length || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400">
                              Absen: {m.attendances?.filter(a => a.status === 'ABSEN').length || 0}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0 pt-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setMeetingToDelete(m); }}
                            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors h-8 w-8"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <div 
                            className="w-8 h-8 rounded-full cursor-pointer bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            onClick={() => navigate(`/teacher/meetings/${m.id}`)}
                          >
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Journal separated below */}
                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                          <FileText size={16} className={`shrink-0 mt-0.5 ${m.journal ? 'text-amber-500' : 'text-zinc-400'}`} />
                          <p className={`italic leading-relaxed ${!m.journal && 'text-zinc-400'}`}>
                            {m.journal || 'Belum ada catatan jurnal...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="w-full">
              {enrollments.length === 0 ? (
                <EmptyState title="Belum Ada Siswa" description="Belum ada siswa yang mendaftar ke kelas ini." />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={enrollments} 
                  searchKey="student.user.name" 
                  searchPlaceholder="Cari nama siswa..." 
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* New Meeting Dialog */}
      <Dialog open={isMeetingOpen} onOpenChange={setIsMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Pertemuan Baru</DialogTitle>
            <DialogDescription>
              Tentukan tanggal pertemuan untuk kelas ini. Judul pertemuan akan di-generate otomatis.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tanggal Pertemuan
            </label>
            <input 
              type="date" 
              value={newMeetingDate}
              onChange={(e) => setNewMeetingDate(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMeetingOpen(false)}>Batal</Button>
            <Button 
              onClick={createMeeting}
              disabled={isSubmittingMeeting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmittingMeeting ? 'Membuat...' : 'Buat Pertemuan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={gradeModal.open} onOpenChange={(open) => !open && setGradeModal({ open: false, enrollmentId: null, studentName: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Nilai Akhir</DialogTitle>
            <DialogDescription>
              Masukkan nilai evaluasi akhir untuk {gradeModal.studentName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitGrade} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Skor (0-100)</label>
              <input 
                type="number" 
                required
                min="0"
                max="100"
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                placeholder="Misal: 85"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Evaluasi / Catatan</label>
              <textarea 
                required
                rows="4"
                value={gradeForm.evaluation}
                onChange={(e) => setGradeForm({ ...gradeForm, evaluation: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white resize-none"
                placeholder="Catatan perkembangan belajar siswa..."
              ></textarea>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setGradeModal({ open: false, enrollmentId: null, studentName: '' })}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingGrade} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isSubmittingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!meetingToDelete}
        onOpenChange={(open) => !open && setMeetingToDelete(null)}
        title="Hapus Pertemuan"
        description={`Apakah Anda yakin ingin menghapus ${meetingToDelete?.title}? Seluruh data absensi pada pertemuan ini juga akan terhapus secara permanen.`}
        onConfirm={deleteMeeting}
        confirmText="Hapus Pertemuan"
        isProcessing={isDeletingMeeting}
        variant="danger"
      />

      <ConfirmDialog
        open={editGradeConfirm.open}
        onOpenChange={(open) => !open && setEditGradeConfirm({ open: false, row: null, finalGrade: null })}
        title="Edit Nilai Akhir"
        description={`Siswa ${editGradeConfirm.row?.student?.user?.name} sudah memiliki nilai ${editGradeConfirm.finalGrade?.score}. Apakah Anda yakin ingin mengubah evaluasi dan nilainya?`}
        onConfirm={() => {
          setGradeModal({ 
            open: true, 
            enrollmentId: editGradeConfirm.row.id, 
            studentName: editGradeConfirm.row.student?.user?.name 
          });
          setGradeForm({ 
            score: editGradeConfirm.finalGrade.score.toString(), 
            evaluation: editGradeConfirm.finalGrade.evaluation 
          });
          setEditGradeConfirm({ open: false, row: null, finalGrade: null });
        }}
        confirmText="Lanjut Edit"
        variant="default"
      />
    </div>
  );
}
