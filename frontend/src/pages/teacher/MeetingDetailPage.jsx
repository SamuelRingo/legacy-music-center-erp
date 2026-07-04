import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { useDashboardCache } from '../../context/DashboardContext';

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { clearDashboardCache } = useDashboardCache();
  
  const [meeting, setMeeting] = useState(null);
  const [journal, setJournal] = useState('');
  const [attendanceState, setAttendanceState] = useState({});
  const [initialJournal, setInitialJournal] = useState('');
  const [initialAttendanceState, setInitialAttendanceState] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unsaved changes handling
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const hasUnsavedChanges = useMemo(() => {
    if (journal !== initialJournal) return true;
    return JSON.stringify(attendanceState) !== JSON.stringify(initialAttendanceState);
  }, [journal, initialJournal, attendanceState, initialAttendanceState]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  const fetchMeeting = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/teacher/meetings/${meetingId}`);
      const m = res.data;
      setMeeting(m);
      setJournal(m.journal || '');
      
      // Build attendance state from master enrollments list
      const stateMap = {};
      const enrollments = m.schedule?.enrollments || [];
      const recordedAttendances = m.attendances || [];

      enrollments.forEach(enr => {
        // find if already recorded
        const rec = recordedAttendances.find(a => a.enrollmentId === enr.id);
        if (rec) {
          stateMap[enr.id] = { status: rec.status, note: rec.note || '' };
        } else {
          stateMap[enr.id] = { status: null, note: '' }; // default: no status
        }
      });
      setAttendanceState(stateMap);
      setInitialJournal(m.journal || '');
      setInitialAttendanceState(JSON.parse(JSON.stringify(stateMap)));
    } catch (error) {
      setError(true);
      toast.error('Gagal memuat detail pertemuan');
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

  const saveMeeting = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save journal
      await api.put(`/teacher/meetings/${meetingId}/journal`, { journal });
      
      // 2. Save attendances
      const payload = {
        attendances: Object.entries(attendanceState)
          .filter(([_, data]) => data.status !== null) // only send if status is chosen
          .map(([enrollmentId, data]) => ({
            enrollmentId,
            status: data.status,
            note: data.note
          }))
      };
      await api.post(`/teacher/meetings/${meetingId}/attendance`, payload);
      
      // Update initial states so it doesn't trigger unsaved changes again
      setInitialJournal(journal);
      setInitialAttendanceState(JSON.parse(JSON.stringify(attendanceState)));
      
      clearDashboardCache('teacher');
      toast.success('Pertemuan berhasil disimpan');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pertemuan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="card" rows={3} />;
  }

  if (error) {
    return <ErrorState onRetry={fetchMeeting} />;
  }

  if (!meeting) return null;

  const enrollments = meeting.schedule?.enrollments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => handleNavigate(`/teacher/schedules/${meeting.scheduleId}`)} className="shrink-0">
            <ChevronLeft size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <nav className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1 flex-wrap">
              <button onClick={() => handleNavigate('/teacher')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Jadwal Mengajar
              </button>
              <span>/</span>
              <button onClick={() => handleNavigate(`/teacher/schedules/${meeting.scheduleId}`)} className="hover:text-zinc-900 dark:hover:text-white transition-colors truncate max-w-[120px] sm:max-w-xs">
                {meeting.schedule?.course?.name}
              </button>
              <span>/</span>
              <span className="text-amber-600 dark:text-amber-500 truncate">{meeting.title}</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">{meeting.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Tanggal: {new Date(meeting.meetingDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {hasUnsavedChanges && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/50">
              Belum disimpan
            </span>
          )}
          <Button 
            onClick={saveMeeting}
            disabled={isSubmitting || !hasUnsavedChanges}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg whitespace-nowrap"
          >
            <Save size={18} />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Semua'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-3">Jurnal Pertemuan</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Catat materi atau progres yang diajarkan pada sesi pertemuan ini.</p>
            <textarea
              rows="8"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Misal: Latihan fingering tangga nada C mayor, siswa mulai lancar menggunakan metronome..."
              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm resize-none"
            ></textarea>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Presensi Siswa</h3>
            
            {enrollments.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Belum ada siswa di kelas ini.</p>
            ) : (
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
                          placeholder="Catatan individu (opsional)..."
                          value={attendanceState[enr.id]?.note || ''}
                          onChange={(e) => handleAttendanceChange(enr.id, 'note', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        title="Simpan perubahan?"
        description="Ada perubahan yang belum Anda simpan. Jika Anda keluar sekarang, perubahan tersebut akan hilang."
        onConfirm={() => {
          setShowUnsavedDialog(false);
          if (pendingNavigation) navigate(pendingNavigation);
        }}
        confirmText="Tetap Keluar"
        variant="danger"
      />
    </div>
  );
}
