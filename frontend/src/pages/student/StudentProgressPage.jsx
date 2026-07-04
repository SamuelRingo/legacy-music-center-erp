import React, { useState, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, FileText, Calendar, Clock, Printer, User, Music, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useCachedQuery } from '../../lib/cache';

export default function StudentProgressPage() {
  const [activeEnrollment, setActiveEnrollment] = useState(null);

  const fetchProgressFn = useCallback(async () => {
    const res = await api.get('/student/progress');
    return res.data;
  }, []);

  const { data: enrollmentsData, loading, error, refetch: fetchProgress } = useCachedQuery('student_progress', fetchProgressFn, 60000);
  const enrollments = enrollmentsData || [];

  if (loading) {
    return <LoadingSkeleton type="card" rows={3} />;
  }

  if (error) {
    return <ErrorState onRetry={fetchProgress} />;
  }

  if (activeEnrollment) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
        <Button 
          variant="ghost" 
          className="-ml-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white" 
          onClick={() => setActiveEnrollment(null)}
        >
          <ChevronLeft size={20} className="mr-1" />
          Kembali ke Daftar Kelas
        </Button>
        <EnrollmentCard enrollment={activeEnrollment} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Progress Belajar</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pilih kelas untuk melihat riwayat pertemuan dan nilai akhir.</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState title="Belum Ada Kelas" description="Anda belum terdaftar di kelas manapun." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(enr => (
            <div 
              key={enr.id} 
              onClick={() => setActiveEnrollment(enr)}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[140px]"
            >
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4 group-hover:text-amber-600 transition-colors">
                {enr.schedule.course.name}
              </h3>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-zinc-400" />
                  <span>{enr.schedule.teacher?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-zinc-400" />
                  <span>{enr.schedule.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-zinc-400" />
                  <span>{enr.schedule.startTime} - {enr.schedule.endTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollmentCard({ enrollment }) {
  const [activeTab, setActiveTab] = useState('meetings');
  const [expandedRows, setExpandedRows] = useState({});
  const { schedule, meetingAttendances, finalGrades } = enrollment;
  const finalGrade = finalGrades && finalGrades.length > 0 ? finalGrades[0] : null;

  const reportRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Rapor_${schedule?.course?.name.replace(/\s+/g, '_')}`
  });

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
      {/* Header - Looks like Jadwal Mengajar card */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Music className="text-amber-500" size={20} />
              {schedule?.course?.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                {schedule?.teacher?.name}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                {schedule?.day}, {schedule?.startTime} - {schedule?.endTime}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'meetings'
                ? 'border-amber-500 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            <Calendar size={16} />
            Riwayat Pertemuan
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'grades'
                ? 'border-amber-500 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            <FileText size={16} />
            Rapor Nilai Akhir
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'meetings' && (
          <div className="space-y-4">
            {meetingAttendances.length === 0 ? (
              <EmptyState title="Belum Ada Pertemuan" description="Belum ada riwayat pertemuan untuk kelas ini." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                    <TableRow>
                      <TableHead className="font-semibold">Pertemuan</TableHead>
                      <TableHead className="font-semibold w-32 md:w-40">Tanggal</TableHead>
                      <TableHead className="font-semibold w-28 text-center">Kehadiran</TableHead>
                      <TableHead className="font-semibold w-16 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingAttendances.map((att) => {
                      const meeting = att.meeting;
                      const isExpanded = expandedRows[att.id];
                      
                      let statusColors = "bg-zinc-100 text-zinc-700 border-zinc-200";
                      if (att.status === 'HADIR') statusColors = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400";
                      if (att.status === 'IZIN') statusColors = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400";
                      if (att.status === 'SAKIT') statusColors = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400";
                      if (att.status === 'ABSEN') statusColors = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/50 dark:text-rose-400";

                      return (
                        <React.Fragment key={att.id}>
                          <TableRow 
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/30' : ''}`}
                            onClick={() => toggleRow(att.id)}
                          >
                            <TableCell className="font-medium text-zinc-900 dark:text-white">{meeting.title}</TableCell>
                            <TableCell>{new Date(meeting.meetingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-2 py-1 rounded-md text-xs font-bold border inline-block ${statusColors}`}>
                                {att.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 pointer-events-none">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </Button>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expanded Content */}
                          {isExpanded && (
                            <TableRow className="bg-zinc-50/50 dark:bg-zinc-800/10 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10">
                              <TableCell colSpan={4} className="p-4">
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                                  {/* Journal */}
                                  <div>
                                    <h5 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <FileText size={14} />
                                      Jurnal Materi
                                    </h5>
                                    <p className={`text-sm italic ${!meeting.journal && 'text-zinc-400'}`}>
                                      {meeting.journal || 'Belum ada catatan jurnal materi.'}
                                    </p>
                                  </div>

                                  {/* Teacher Note */}
                                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <h5 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <User size={14} />
                                      Catatan Kehadiran Guru
                                    </h5>
                                    <p className={`text-sm italic ${!att.note && 'text-zinc-400'}`}>
                                      {att.note || 'Tidak ada catatan khusus dari guru.'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grades' && (
          <div>
            {!finalGrade ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400">Belum ada nilai akhir. Guru belum memberikan evaluasi.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Dokumen Rapor</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Guru sudah memberikan evaluasi akhir untuk kelas ini.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Button onClick={handlePrint} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                      <Printer size={16} />
                      Cetak Rapor
                    </Button>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic text-center sm:text-right w-full">Di HP, pilih 'Save as PDF' untuk menyimpan rapor.</p>
                  </div>
                </div>

                {/* Printable Area */}
                <style type="text/css" media="print">
                  {`
                    @page { size: A4 portrait; margin: 20mm; }
                    @media print {
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .no-print { display: none !important; }
                    }
                  `}
                </style>
                <div 
                  ref={reportRef} 
                  className="bg-white p-6 sm:p-8 md:p-12 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-900 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:text-black"
                >
                  <div className="text-center mb-8 border-b-2 border-zinc-800 pb-6">
                    <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 mb-2">Rapor Nilai Akhir</h1>
                    <p className="text-lg font-medium text-zinc-600">Legacy Musik</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8 text-sm md:text-base">
                    <div>
                      <p className="text-zinc-500 mb-1">Program Kursus</p>
                      <p className="font-bold text-zinc-900 text-lg">{schedule?.course?.name}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 mb-1">Instruktur / Guru</p>
                      <p className="font-bold text-zinc-900">{schedule?.teacher?.name}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-xl p-8 text-center mb-8 border border-zinc-100">
                    <p className="text-zinc-500 mb-2 font-medium uppercase tracking-wider text-sm">Nilai Akhir</p>
                    <div className="text-6xl font-black text-amber-600">
                      {finalGrade.score}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-zinc-900 mb-3 border-b border-zinc-200 pb-2">Evaluasi & Catatan Instruktur</h3>
                    <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {finalGrade.evaluation || '-'}
                    </p>
                  </div>
                  
                  <div className="mt-16 pt-8 border-t border-zinc-200 flex justify-between items-end">
                    <div className="text-sm text-zinc-500">
                      <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                      <p className="font-medium mt-1">Sistem Informasi Legacy Musik</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-500 mb-12">Instruktur</p>
                      <p className="font-bold text-zinc-900 border-t border-zinc-300 pt-2 px-4">{schedule?.teacher?.name}</p>
                    </div>
                  </div>
                </div>
                {/* End Printable Area */}
                
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
