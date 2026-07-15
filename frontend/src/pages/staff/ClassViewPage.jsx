import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock, MapPin, Loader2, User } from 'lucide-react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';

export default function ClassViewPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassData();
  }, [scheduleId]);

  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      const [scheduleRes, studentsRes, meetingsRes] = await Promise.all([
        api.get(`/staff/schedules/${scheduleId}`),
        api.get(`/staff/schedules/${scheduleId}/students`),
        api.get(`/staff/schedules/${scheduleId}/meetings`)
      ]);
      setSchedule(scheduleRes.data);
      setStudents(studentsRes.data);
      setMeetings(meetingsRes.data);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError('Gagal mengambil data kelas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
        <p className="text-zinc-500">Memuat detail kelas...</p>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Kelas tidak ditemukan'}</p>
        <Button onClick={() => navigate('/staff/schedules')} variant="outline">
          Kembali ke Jadwal
        </Button>
      </div>
    );
  }

  const studentColumns = [
    { header: 'Nama Murid', cell: (row) => row.user?.name },
    { header: 'Level', cell: (row) => <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-medium">{row.gradeLevel}</span> },
    { 
      header: 'Nilai Akhir', 
      cell: (row) => {
        const grade = row.grades?.[0];
        if (!grade) return '-';
        return <span className="font-semibold text-amber-600">{grade.score}</span>;
      }
    },
    { 
      header: 'Kehadiran Terakhir', 
      cell: (row) => {
        const lastAtt = row.StudentAttendance?.[0];
        if (!lastAtt) return '-';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            lastAtt.status === 'HADIR' ? 'bg-emerald-100 text-emerald-700' :
            lastAtt.status === 'SAKIT' || lastAtt.status === 'IZIN' ? 'bg-amber-100 text-amber-700' :
            lastAtt.status === 'ABSEN' ? 'bg-rose-100 text-rose-700' :
            'bg-zinc-100 text-zinc-700'
          }`}>
            {lastAtt.status}
          </span>
        );
      } 
    }
  ];

  const meetingColumns = [
    { header: 'Tanggal', cell: (row) => new Date(row.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
    { header: 'Materi / Topik', cell: (row) => row.topic || '-' },
    { 
      header: 'Kehadiran', 
      cell: (row) => {
        const presentCount = row._count?.attendances || 0;
        const total = students.length;
        return `${presentCount} / ${total} Hadir`;
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/staff/schedules')}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {schedule.course?.name}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1"><User size={14} /> {schedule.teacher?.name}</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> {schedule.day}</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {schedule.startTime} - {schedule.endTime}</span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> {schedule.classroom?.name}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Daftar Murid Section */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Daftar Murid</h2>
            <span className="ml-auto text-sm text-zinc-500">{students.length} terdaftar</span>
          </div>
          <DataTable 
            columns={studentColumns} 
            data={students} 
            searchKey="user.name"
            searchPlaceholder="Cari nama murid..."
            pagination={false}
          />
        </div>

        {/* Riwayat Pertemuan Section */}
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Riwayat Pertemuan</h2>
            <span className="ml-auto text-sm text-zinc-500">{meetings.length} pertemuan</span>
          </div>
          <DataTable 
            columns={meetingColumns} 
            data={meetings} 
            searchKey="topic"
            searchPlaceholder="Cari topik..."
            pagination={false}
          />
        </div>
      </div>
    </div>
  );
}
