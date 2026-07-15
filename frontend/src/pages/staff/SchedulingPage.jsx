import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Eye, Trash2, BookOpen, User, MapPin, Calendar, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useCachedQuery, clearCache } from '../../lib/cache';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

export default function SchedulingPage() {
  const navigate = useNavigate();
  const fetchSchedulesFn = useCallback(async () => {
    const [schedRes, courseRes, teacherRes, roomRes] = await Promise.all([
      api.get('/staff/schedules'),
      api.get('/staff/courses'),
      api.get('/staff/teachers'),
      api.get('/staff/classrooms'),
    ]);
    return { schedules: schedRes.data, courses: courseRes.data, teachers: teacherRes.data, classrooms: roomRes.data };
  }, []);

  const { data: masterData, loading, error, refetch: fetchData } = useCachedQuery('staff_schedules_master', fetchSchedulesFn);
  
  const schedules = masterData?.schedules || [];
  const courses = masterData?.courses || [];
  const teachers = masterData?.teachers || [];
  const classrooms = masterData?.classrooms || [];

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    courseId: '',
    teacherId: '',
    classroomId: '',
    day: '',
    startTime: '',
    endTime: ''
  });
  
  const [conflictStatus, setConflictStatus] = useState(null);

  useEffect(() => {
    let active = true;
    const { teacherId, day, startTime, endTime, id } = formData;
    
    if (teacherId && day && startTime && endTime) {
      const handler = setTimeout(async () => {
        try {
          await api.get('/staff/schedules/check-conflict', {
            params: { teacherId, day, startTime, endTime, excludeId: id }
          });
          if (active) setConflictStatus(false);
        } catch (error) {
          if (active && error.response?.status === 409) {
            setConflictStatus(error.response.data.message);
          }
        }
      }, 500);
      return () => { active = false; clearTimeout(handler); };
    } else {
      setConflictStatus(null);
    }
  }, [formData.teacherId, formData.day, formData.startTime, formData.endTime, formData.id]);



  const resetForm = () => {
    setFormData({
      id: '', courseId: '', teacherId: '', classroomId: '', day: '', startTime: '', endTime: ''
    });
    setMessage({ text: '', type: '' });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    resetForm();
    setFormData({
      id: schedule.id,
      courseId: schedule.courseId,
      teacherId: schedule.teacherId,
      classroomId: schedule.classroomId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (schedule) => {
    setScheduleToDelete(schedule);
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/staff/schedules/${scheduleToDelete.id}`);
      clearCache('staff_schedules_master');
      fetchData();
      setIsDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Gagal menghapus jadwal');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      if (isEditing) {
        await api.put(`/staff/schedules/${formData.id}`, formData);
        setMessage({ text: 'Jadwal berhasil diupdate', type: 'success' });
      } else {
        await api.post('/staff/schedules', formData);
        setMessage({ text: 'Jadwal berhasil ditambahkan', type: 'success' });
      }
      clearCache('staff_schedules_master');
      fetchData();
      setTimeout(() => setIsDialogOpen(false), 1000);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.message || 'Jadwal bentrok');
      } else {
        setMessage({ 
          text: error.response?.data?.message || 'Terjadi kesalahan sistem', 
          type: 'error' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Program Kursus', 
      cell: (row) => row.isSeparator ? (
        <>
          <div className="opacity-0 h-5">{row.day}</div>
          <div className="day-separator-marker absolute left-0 right-0 flex justify-center text-amber-800 dark:text-amber-200 font-bold text-sm tracking-wide uppercase mt-[-20px]">
            {row.day}
          </div>
        </>
      ) : row.course?.name 
    },
    { header: 'Guru', cell: (row) => row.isSeparator ? null : row.teacher?.name },
    { header: 'Ruangan', cell: (row) => row.isSeparator ? null : row.classroom?.name },
    { header: 'Waktu', cell: (row) => row.isSeparator ? null : `${row.startTime} - ${row.endTime}` },
    { header: 'Terisi', cell: (row) => row.isSeparator ? null : `${row.enrollments?.length || 0} / ${row.classroom?.capacity || 0}` },
    {
      header: 'Aksi',
      cell: (row) => row.isSeparator ? null : (
        <ActionMenu 
          actions={[
            {
              label: 'Lihat Kelas',
              icon: Eye,
              onClick: () => navigate(`/staff/classes/${row.id}`)
            },
            {
              label: 'Edit Jadwal',
              icon: Edit2,
              onClick: () => handleOpenEdit(row)
            },
            {
              label: 'Hapus Jadwal',
              icon: Trash2,
              onClick: () => handleDeleteClick(row),
              isDanger: true
            }
          ]}
        />
      )
    }
  ];

  // Susun dan sisipkan baris pemisah
  const sortedAndGroupedSchedules = (() => {
    // Sort schedules berdasarkan hari dan waktu mulai
    const sorted = [...schedules].sort((a, b) => {
      const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    });

    const result = [];
    let currentDay = null;
    let currentSeparator = null;

    sorted.forEach((sched) => {
      if (sched.day !== currentDay) {
        currentDay = sched.day;
        currentSeparator = { 
          isSeparator: true, 
          day: currentDay, 
          id: `sep-${currentDay}`,
          course: { name: '' }
        };
        result.push(currentSeparator);
      }
      result.push(sched);
      
      // Kumpulkan nama course agar baris separator lolos filter search
      if (currentSeparator && sched.course?.name) {
        currentSeparator.course.name += ` ${sched.course.name} `;
      }
    });
    return result;
  })();

  return (
    <div className="space-y-6">
      <style>{`
        tr:has(.day-separator-marker) {
          background-color: #fffbeb;
        }
        .dark tr:has(.day-separator-marker) {
          background-color: rgba(120, 53, 15, 0.2);
        }
        tr:has(.day-separator-marker) td {
          border-top: 2px solid #fde68a !important;
          border-bottom: 1px solid #e4e4e7 !important;
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        }
        .dark tr:has(.day-separator-marker) td {
          border-top: 2px solid #92400e !important;
          border-bottom: 1px solid #3f3f46 !important;
        }
        .scheduling-table-container > div > div.rounded-lg {
          position: relative;
        }
      `}</style>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manajemen Jadwal & Kelas</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Atur jadwal mengajar, ruangan, dan program kursus.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg">
          <Plus size={18} />
          Tambah Jadwal
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : sortedAndGroupedSchedules.length === 0 ? (
        <EmptyState title="Belum Ada Jadwal" description="Silakan buat jadwal kelas pertama Anda." />
      ) : (
        <div className="scheduling-table-container">
          <DataTable 
            columns={columns} 
            data={sortedAndGroupedSchedules} 
            searchKey="course.name" 
            searchPlaceholder="Cari program kursus..." 
            pagination={false}
          />
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white dark:bg-zinc-950 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <DialogTitle className="text-xl">
              {isEditing ? 'Edit Jadwal Kelas' : 'Tambah Jadwal Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-8">
              {/* Grid for all selects */}
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <BookOpen size={16} /> Program Kursus
                  </Label>
                  <Select value={formData.courseId} onValueChange={(val) => setFormData({...formData, courseId: val})} required>
                    <SelectTrigger className="bg-white dark:bg-zinc-900 shadow-sm h-10">
                      <SelectValue placeholder="Pilih Kursus">
                        {courses.find(c => c.id === formData.courseId)?.name || 'Pilih Kursus'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <User size={16} /> Guru / Pengajar
                  </Label>
                  <Select value={formData.teacherId} onValueChange={(val) => setFormData({...formData, teacherId: val})} required>
                    <SelectTrigger className={`bg-white dark:bg-zinc-900 shadow-sm h-10 ${conflictStatus ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih Guru">
                        {teachers.find(t => t.id === formData.teacherId)?.name || 'Pilih Guru'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <MapPin size={16} /> Ruangan
                  </Label>
                  <Select value={formData.classroomId} onValueChange={(val) => setFormData({...formData, classroomId: val})} required>
                    <SelectTrigger className="bg-white dark:bg-zinc-900 shadow-sm h-10">
                      <SelectValue placeholder="Pilih Ruangan">
                        {classrooms.find(r => r.id === formData.classroomId)?.name || 'Pilih Ruangan'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name} (Kap: {r.capacity})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar size={16} /> Hari
                  </Label>
                  <Select value={formData.day} onValueChange={(val) => setFormData({...formData, day: val})} required>
                    <SelectTrigger className={`bg-white dark:bg-zinc-900 shadow-sm h-10 ${conflictStatus ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih Hari">
                        {formData.day || 'Pilih Hari'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Range Section */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold">
                    <Clock size={16} /> Waktu Pelaksanaan
                  </Label>
                  <span className="text-[11px] text-zinc-500">Pilih cepat atau ketik manual</span>
                </div>
                
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-xl border w-full ${conflictStatus ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                    <Input 
                      type="time" 
                      value={formData.startTime} 
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                      required 
                      className={`bg-white dark:bg-zinc-900 text-center font-mono shadow-sm flex-1 h-10 ${conflictStatus ? 'border-red-500 text-red-600' : ''}`}
                    />
                    <span className="text-zinc-400 font-medium shrink-0 text-sm px-2">sampai</span>
                    <Input 
                      type="time" 
                      value={formData.endTime} 
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                      required 
                      className={`bg-white dark:bg-zinc-900 text-center font-mono shadow-sm flex-1 h-10 ${conflictStatus ? 'border-red-500 text-red-600' : ''}`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      ['09:00', '10:00'], 
                      ['10:00', '11:00'], 
                      ['13:00', '14:00'], 
                      ['15:00', '16:00'], 
                      ['16:00', '17:00'],
                      ['19:00', '20:00']
                    ].map(([start, end]) => (
                      <button
                        key={`${start}-${end}`}
                        type="button"
                        onClick={() => setFormData({...formData, startTime: start, endTime: end})}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm"
                      >
                        {start} - {end}
                      </button>
                    ))}
                  </div>

                  {conflictStatus === false && (
                    <div className="mt-3 text-sm text-emerald-600 dark:text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      ✅ Jadwal tersedia.
                    </div>
                  )}
                  {conflictStatus && typeof conflictStatus === 'string' && (
                    <div className="mt-3 text-sm text-red-600 dark:text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                      ⚠️ {conflictStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="px-6">
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || typeof conflictStatus === 'string'} className="px-6 bg-zinc-900 hover:bg-zinc-800 text-white disabled:opacity-50">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 dark:text-red-500 flex items-center gap-2">
              <Trash2 size={20} />
              Konfirmasi Hapus
            </DialogTitle>
          </DialogHeader>
          
          {deleteError && (
            <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg text-sm font-medium">
              {deleteError}
            </div>
          )}

          <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400">
            Apakah Anda yakin ingin menghapus jadwal <strong>{scheduleToDelete?.course?.name}</strong> pada hari <strong>{scheduleToDelete?.day}</strong> pukul <strong>{scheduleToDelete?.startTime}</strong>?<br/><br/>
            Tindakan ini tidak dapat dibatalkan.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} className="bg-white dark:bg-zinc-900 shadow-sm">
              Batal
            </Button>
            <Button onClick={handleConfirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
              {isDeleting ? 'Menghapus...' : 'Hapus Jadwal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
