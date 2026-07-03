import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, Inbox, Calendar, User, Phone, MapPin } from 'lucide-react';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { Eye } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function ApprovalPage() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  
  // Assignment state
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [pendingRes, schedRes] = await Promise.all([
        api.get('/staff/pending'),
        api.get('/staff/schedules')
      ]);
      setPendingStudents(pendingRes.data);
      setSchedules(schedRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (studentUser) => {
    setSelectedStudent(studentUser);
    setSelectedScheduleId('');
    setMessage({ text: '', type: '' });
    setIsDialogOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedScheduleId) return;
    setIsEnrolling(true);
    setMessage({ text: '', type: '' });
    try {
      await api.post('/staff/enroll', {
        studentUserId: selectedStudent.id,
        scheduleId: selectedScheduleId
      });
      setMessage({ text: 'Jadwal berhasil ditambahkan', type: 'success' });
      fetchData(); // refresh to show enrollment
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Gagal menambahkan jadwal', type: 'error' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleApprove = async () => {
    setIsActivating(true);
    setMessage({ text: '', type: '' });
    try {
      // Auto-generate invoice first so it is never skipped
      await api.post('/staff/invoices/generate', {
        studentId: selectedStudent.studentProfile?.id
      });
      
      // Then approve (activate) the account
      await api.post(`/staff/approve/${selectedStudent.id}`);
      
      setMessage({ text: 'Siswa berhasil diaktifkan & Tagihan pertama dibuat', type: 'success' });
      fetchData();
      
      // Close dialog after short delay
      setTimeout(() => setIsDialogOpen(false), 1500);
    } catch (error) {
      setMessage({ text: 'Gagal memproses aktivasi siswa', type: 'error' });
    } finally {
      setIsActivating(false);
    }
  };

  const columns = [
    { header: 'Nama Lengkap', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'No. HP Ortu', cell: (row) => row.studentProfile?.parentPhone || '-' },
    { header: 'Tanggal Daftar', cell: (row) => new Date(row.createdAt).toLocaleDateString('id-ID') },
    { 
      header: 'Status', 
      cell: () => (
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded text-xs font-medium">
          PENDING
        </span>
      ) 
    },
    {
      header: 'Aksi',
      cell: (row) => (
        <ActionMenu
          actions={[
            { label: 'Lihat', icon: Eye, onClick: () => handleRowClick(row) }
          ]}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Persetujuan Siswa Baru</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Pilih siswa untuk mengatur jadwal, membuat tagihan, dan mengaktifkan akun.</p>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={4} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : pendingStudents.length === 0 ? (
        <EmptyState title="Tidak Ada Menunggu Approval" description="Semua siswa baru sudah dikonfirmasi." />
      ) : (
        <DataTable 
          columns={columns} 
          data={pendingStudents} 
          searchKey="name" 
          searchPlaceholder="Cari nama siswa..." 
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Detail Pendaftaran Siswa</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6 py-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Nama Lengkap</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Email</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedStudent.email}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">No. HP Orang Tua (WhatsApp)</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedStudent.studentProfile?.parentPhone || '-'}</p>
                  </div>
                  <div className="sm:col-span-2 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Alamat Lengkap</p>
                    <p className="font-semibold text-zinc-900 dark:text-white leading-relaxed">{selectedStudent.studentProfile?.address || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Penugasan Kelas (Assign Schedule)
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                    <SelectTrigger className="flex-1 bg-white dark:bg-zinc-900 shadow-sm">
                      <SelectValue placeholder="Pilih jadwal kelas">
                        {selectedScheduleId ? (() => {
                          const sched = schedules.find(s => s.id === selectedScheduleId);
                          return sched ? `${sched.course.name} - ${sched.day} (${sched.startTime}-${sched.endTime})` : 'Pilih jadwal kelas';
                        })() : 'Pilih jadwal kelas'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.map(sched => (
                        <SelectItem key={sched.id} value={sched.id}>
                          {sched.course.name} - {sched.day} ({sched.startTime}-{sched.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleEnroll} disabled={!selectedScheduleId || isEnrolling} variant="outline" className="shrink-0 bg-white dark:bg-zinc-900 shadow-sm">
                    {isEnrolling ? 'Menyimpan...' : 'Tambahkan'}
                  </Button>
                </div>
                
                {/* List of current enrollments */}
                <div className="mt-4 space-y-2">
                  {pendingStudents.find(s => s.id === selectedStudent.id)?.studentProfile?.enrollments?.map(enroll => (
                    <div key={enroll.id} className="text-xs px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg flex justify-between items-center border border-emerald-100 dark:border-emerald-900/30">
                      <span className="text-emerald-900 dark:text-emerald-100">{enroll.schedule.course.name} ({enroll.schedule.day})</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-white dark:bg-zinc-950 px-2 py-0.5 rounded shadow-sm">Assigned</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end items-center w-full border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6">
            <Button onClick={() => setConfirmApprove(true)} disabled={isActivating} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-sm">
              {isActivating ? 'Memproses Aktivasi & Tagihan...' : 'Aktifkan Akun & Buat Tagihan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmApprove}
        onOpenChange={setConfirmApprove}
        title="Approve Siswa"
        description="Apakah Anda yakin ingin mengaktifkan akun siswa ini dan generate tagihan pertamanya? Pastikan semua jadwal kelas sudah di-assign dengan benar."
        variant="default"
        confirmText="Ya, Aktifkan"
        onConfirm={handleApprove}
        isProcessing={isActivating}
      />
    </div>
  );
}
