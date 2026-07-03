import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users, CalendarCheck, FileBadge, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Attendance Modal
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceState, setAttendanceState] = useState({});
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // Grade Modal
  const [gradeModal, setGradeModal] = useState({ open: false, enrollmentId: null, studentName: '' });
  const [gradeForm, setGradeForm] = useState({ score: '', evaluation: '' });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, [id]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teacher/enrollments/${id}`);
      setScheduleData(res.data.schedule);
      setEnrollments(res.data.enrollments);
      
      // Initialize attendance state (default HADIR)
      const initialAtt = {};
      res.data.enrollments.forEach(enr => {
        initialAtt[enr.id] = { status: 'HADIR', journal: '' };
      });
      setAttendanceState(initialAtt);
    } catch (error) {
      toast.error('Gagal memuat data kelas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (enrollmentId, field, value) => {
    setAttendanceState(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value
      }
    }));
  };

  const submitAttendance = async () => {
    setIsSubmittingAttendance(true);
    const payload = {
      date: attendanceDate,
      attendances: Object.entries(attendanceState).map(([enrollmentId, data]) => ({
        enrollmentId,
        status: data.status,
        journal: data.journal
      }))
    };

    try {
      const res = await api.post('/teacher/attendance', payload);
      toast.success(res.data.message || 'Presensi berhasil disimpan');
      setIsAttendanceOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan presensi');
    } finally {
      setIsSubmittingAttendance(false);
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
      toast.success('Nilai akhir berhasil disimpan');
      setGradeModal({ open: false, enrollmentId: null, studentName: '' });
      setGradeForm({ score: '', evaluation: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const columns = [
    { header: 'Nama Siswa', cell: (row) => row.student?.user?.name },
    { 
      header: 'Tanggal Daftar', 
      cell: (row) => new Date(row.enrolledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 text-zinc-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50"
          onClick={() => {
            setGradeModal({ open: true, enrollmentId: row.id, studentName: row.student?.user?.name });
          }}
        >
          <FileBadge size={14} />
          Beri Nilai Akhir
        </Button>
      )
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola presensi dan nilai siswa untuk kelas ini.</p>
        </div>
        <Button 
          onClick={() => setIsAttendanceOpen(true)}
          className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
          disabled={enrollments.length === 0}
        >
          <CalendarCheck size={18} />
          Isi Presensi
        </Button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
        </div>
      ) : (
        <div className="w-full">
          <DataTable 
            columns={columns} 
            data={enrollments} 
            searchKey="student.user.name" 
            searchPlaceholder="Cari nama siswa..." 
          />
        </div>
      )}

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Isi Presensi Kelas</DialogTitle>
            <DialogDescription>
              Silakan isi status kehadiran dan jurnal materi untuk masing-masing siswa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Tanggal Pertemuan
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              {enrollments.map((enr) => (
                <div key={enr.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-48 shrink-0">
                      <p className="font-bold text-zinc-900 dark:text-white">{enr.student?.user?.name}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {['HADIR', 'ABSEN', 'IZIN', 'SAKIT'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleAttendanceChange(enr.id, 'status', status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            attendanceState[enr.id]?.status === status
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:border-amber-500/50 dark:text-amber-300'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Catatan jurnal materi hari ini..."
                        value={attendanceState[enr.id]?.journal || ''}
                        onChange={(e) => handleAttendanceChange(enr.id, 'journal', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>Batal</Button>
            <Button 
              onClick={submitAttendance} 
              disabled={isSubmittingAttendance}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmittingAttendance ? 'Menyimpan...' : 'Simpan Presensi'}
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
    </div>
  );
}
