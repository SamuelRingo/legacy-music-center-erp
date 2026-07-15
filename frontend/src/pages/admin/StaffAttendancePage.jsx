import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Save, Printer } from 'lucide-react';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import { toast } from 'sonner';

const BULAN = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
];

export default function StaffAttendancePage() {
  // State for Main Attendance Sheet
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [errorSheet, setErrorSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('harian');

  // State for History
  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchSheet = useCallback(async () => {
    setLoadingSheet(true);
    setErrorSheet(false);
    try {
      const res = await api.get('/admin/staff-attendance', {
        params: { date: selectedDate }
      });
      const sheetData = (res.data || []).map(item => ({
        userId: item.userId,
        name: item.name,
        role: item.role,
        status: item.dbStatus || 'PRESENT',
        note: item.note || ''
      }));
      setAttendanceSheet(sheetData);
    } catch (err) {
      console.error(err);
      setErrorSheet(true);
    } finally {
      setLoadingSheet(false);
    }
  }, [selectedDate]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/admin/staff-attendance/history', {
        params: { month: parseInt(monthFilter), year: parseInt(yearFilter) }
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Laporan_Absensi_Staff_${monthFilter}_${yearFilter}`,
  });

  const historyMetrics = useMemo(() => {
    return {
      present: history.filter(h => h.status === 'PRESENT').length,
      late: history.filter(h => h.status === 'LATE' || h.status === 'LEAVE').length,
      absent: history.filter(h => h.status === 'ABSENT').length,
    };
  }, [history]);

  const mappedHistory = useMemo(() => {
    return history.sort((a, b) => new Date(b.date) - new Date(a.date)).map(h => ({
      ...h,
      staffName: h.user?.name || '-'
    }));
  }, [history]);

  const handleAttendanceChange = (userId, field, value) => {
    setAttendanceSheet(prev => 
      prev.map(item => item.userId === userId ? { ...item, [field]: value } : item)
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = attendanceSheet.map(item => ({
        userId: item.userId,
        date: selectedDate,
        status: item.status,
        note: item.note
      }));
      await api.post('/admin/staff-attendance', payload);
      toast.success('Absensi berhasil disimpan');
      fetchHistory(); // refresh history
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = {
    present: attendanceSheet.filter(a => a.status === 'PRESENT').length,
    late: attendanceSheet.filter(a => a.status === 'LATE').length,
    leave: attendanceSheet.filter(a => a.status === 'LEAVE').length,
    absent: attendanceSheet.filter(a => a.status === 'ABSENT').length,
  };

  if (errorSheet) {
    return (
      <DashboardLayout>
        <ErrorState message="Gagal memuat daftar absensi hari ini." onRetry={fetchSheet} />
  
      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef} className="print:p-0 print:bg-white print:text-black print:text-[12pt] print:w-full print:max-w-full print:overflow-hidden p-8">
          <style type="text/css" media="print">
            {`
              @page { size: A4; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            `}
          </style>
          
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4 mb-4">
              <img src="/Logolegacymusic.webp" alt="Legacy Music Center" className="h-[120px] w-auto object-contain" />
              <div>
                <h1 className="text-[14pt] font-bold text-black m-0 p-0 leading-tight">Legacy Music Center</h1>
                <p className="text-[10pt] text-zinc-700 m-0 p-0">Jl. Musik Harmoni No. 88, Jakarta Selatan, 12345 | Telp: (021) 555-1234</p>
              </div>
            </div>
            <h2 className="text-[14pt] font-bold text-center text-black m-0 uppercase underline decoration-2 underline-offset-4">
              Laporan Absensi Staff
            </h2>
            <p className="text-center text-[10pt] mt-1 text-black">
              Bulan {BULAN.find(b => b.value.toString() === monthFilter)?.label} {yearFilter}
            </p>
          </div>
          
          <div className="hidden print:block">
            <table className="w-full text-left border-collapse border border-black mb-8">
              <thead>
                <tr className="border-b border-black bg-zinc-100 print:bg-zinc-100">
                  <th className="py-2 px-4 border-r border-black">Nama Staff</th>
                  <th className="py-2 px-4 border-r border-black">Tanggal</th>
                  <th className="py-2 px-4 border-r border-black">Status</th>
                  <th className="py-2 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {mappedHistory.map((h, idx) => {
                  let statusLabel = 'Unknown';
                  if (h.status === 'PRESENT') statusLabel = 'Hadir';
                  else if (h.status === 'LATE') statusLabel = 'Sakit/Izin';
                  else if (h.status === 'LEAVE') statusLabel = 'Cuti';
                  else if (h.status === 'ABSENT') statusLabel = 'Absen';

                  return (
                    <tr key={h.id || idx} className="border-b border-black">
                      <td className="py-2 px-4 border-r border-black font-medium">{h.staffName}</td>
                      <td className="py-2 px-4 border-r border-black">{new Date(h.date).toLocaleDateString('en-GB')}</td>
                      <td className="py-2 px-4 border-r border-black">{statusLabel}</td>
                      <td className="py-2 px-4">{h.note || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="mt-16 text-right text-sm">
              <p>Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
              <br/><br/><br/>
              <p className="font-bold underline">HR / Admin</p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-zinc-300 text-center text-xs text-zinc-500">
              Dicetak pada {new Date().toLocaleDateString('id-ID')} • © 2026 Legacy Music Center
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>

    );
  }

  const historyColumns = [
    {
      header: 'Nama Staff',
      accessorKey: 'staffName',
      cell: (row) => <span className="font-medium text-zinc-900 dark:text-white">{row.staffName}</span>
    },
    {
      header: 'Tanggal',
      cell: (row) => <span className="text-zinc-600 dark:text-zinc-400">{new Date(row.date).toLocaleDateString('en-GB')}</span>
    },
    {
      header: 'Status',
      cell: (row) => {
        let badgeClass = 'bg-zinc-100 text-zinc-700';
        let label = 'Unknown';
        if (row.status === 'PRESENT') { badgeClass = 'bg-emerald-100 text-emerald-700'; label = 'Hadir'; }
        else if (row.status === 'LATE') { badgeClass = 'bg-amber-100 text-amber-700'; label = 'Sakit/Izin'; }
        else if (row.status === 'LEAVE') { badgeClass = 'bg-blue-100 text-blue-700'; label = 'Cuti'; }
        else if (row.status === 'ABSENT') { badgeClass = 'bg-rose-100 text-rose-700'; label = 'Absen'; }
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass}`}>{label}</span>;
      }
    },
    {
      header: 'Catatan',
      cell: (row) => <span className="text-zinc-600 dark:text-zinc-400 max-w-xs truncate">{row.note || '-'}</span>
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Absensi Staff</h1>
          <p className="text-sm text-zinc-500">Kelola dan pantau kehadiran seluruh guru serta staf</p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {[
            { id: 'harian', label: 'Absensi Harian' },
            { id: 'riwayat', label: 'Riwayat Bulanan' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-amber-600 text-amber-600' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {activeTab === 'harian' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <MetricCard title="Total Hadir" value={metrics.present} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-900/30" />
              <MetricCard title="Sakit / Izin" value={metrics.late} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100 dark:bg-amber-900/30" />
              <MetricCard title="Total Cuti" value={metrics.leave} icon={Clock} colorClass="text-blue-600" bgClass="bg-blue-100 dark:bg-blue-900/30" />
              <MetricCard title="Total Absen" value={metrics.absent} icon={XCircle} colorClass="text-rose-600" bgClass="bg-rose-100 dark:bg-rose-900/30" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: Date Picker */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-6">
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-3">Tanggal Absensi</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Pilih tanggal untuk melihat atau mengisi rekap kehadiran hari tersebut.</p>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="w-full"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Attendance Sheet */}
              <div className="lg:col-span-2">
                <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden rounded-2xl">
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <CardTitle>Lembar Absensi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingSheet ? (
                      <div className="p-6">
                        <LoadingSkeleton type="table" rows={4} columns={3} />
                      </div>
                    ) : attendanceSheet.length === 0 ? (
                      <div className="p-6">
                         <EmptyState title="Belum ada data" description="Tidak ada staf atau guru yang terdaftar." />
                      </div>
                    ) : (
                      <div>
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {attendanceSheet.map((item) => (
                            <div key={item.userId} className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center gap-4 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                              
                              <div className="w-full xl:w-1/3 flex flex-col">
                                <span className="font-bold text-zinc-900 dark:text-white">{item.name}</span>
                                <span className="text-xs text-zinc-500 mt-1 inline-block bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full w-max">
                                  {item.role === 'TEACHER' ? 'Guru' : 'Staff'}
                                </span>
                              </div>
                              
                              <div className="flex gap-2">
                                {['PRESENT', 'LATE', 'LEAVE', 'ABSENT'].map(status => {
                                  const labels = { 'PRESENT': 'Hadir', 'LATE': 'Sakit/Izin', 'LEAVE': 'Cuti', 'ABSENT': 'Absen' };
                                  const isActive = item.status === status;
                                  let activeClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:border-amber-500/50 dark:text-amber-300';
                                  if (status === 'PRESENT') activeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-500/50 dark:text-emerald-300';
                                  else if (status === 'LEAVE') activeClass = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:border-blue-500/50 dark:text-blue-300';
                                  else if (status === 'ABSENT') activeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:border-rose-500/50 dark:text-rose-300';

                                  return (
                                    <button
                                      key={status}
                                      onClick={() => handleAttendanceChange(item.userId, 'status', status)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                        isActive
                                          ? activeClass
                                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                      }`}
                                    >
                                      {labels[status]}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex-1 min-w-[200px]">
                                <input 
                                  type="text" 
                                  placeholder="Catatan (Opsional)..."
                                  value={item.note}
                                  onChange={(e) => handleAttendanceChange(item.userId, 'note', e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white transition-all"
                                />
                              </div>
                              
                            </div>
                          ))}
                        </div>
                        
                        {/* BOTTOM SECTION: Save Button */}
                        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                          <Button 
                            onClick={handleSave} 
                            disabled={isSubmitting} 
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm"
                          >
                            <Save size={18} />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Absensi Hari Ini'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
                <MetricCard title="Total Hadir" value={historyMetrics.present} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-900/30" />
                <MetricCard title="Total Terlambat" value={historyMetrics.late} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100 dark:bg-amber-900/30" />
                <MetricCard title="Total Absen" value={historyMetrics.absent} icon={XCircle} colorClass="text-rose-600" bgClass="bg-rose-100 dark:bg-rose-900/30" />
              </div>
              <div className="flex items-center gap-2">
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-32 bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Bulan">{monthFilter ? BULAN.find(b => b.value.toString() === monthFilter)?.label : "Bulan"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BULAN.map((b) => (
                      <SelectItem key={b.value} value={b.value.toString()}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-24 bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Tahun">{yearFilter || "Tahun"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 bg-zinc-50 dark:bg-zinc-900">
                <CardTitle>Riwayat Absensi</CardTitle>
                <Button variant="outline" onClick={handlePrint} className="border-zinc-200">
                  <Printer className="w-4 h-4 mr-2" /> Cetak Riwayat
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loadingHistory ? (
                  <div className="p-6">
                    <LoadingSkeleton type="table" rows={3} columns={4} />
                  </div>
                ) : mappedHistory.length === 0 ? (
                  <div className="p-6">
                    <EmptyState title="Belum ada riwayat" description="Tidak ada data absensi di bulan ini." />
                  </div>
                ) : (
                  <DataTable 
                    columns={historyColumns} 
                    data={mappedHistory} 
                    searchKey="staffName" 
                    searchPlaceholder="Cari nama staff..." 
                    searchable={true} 
                    pagination={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
      </div>

      {/* Hidden Print Area */}
      <div className="hidden">
        <div ref={printRef} className="print:p-0 print:bg-white print:text-black print:text-[12pt] print:w-full print:max-w-full print:overflow-hidden p-8">
          <style type="text/css" media="print">
            {`
              @page { size: A4; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            `}
          </style>
          
          <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
            <div className="flex items-center gap-4 mb-4">
              <img src="/Logolegacymusic.webp" alt="Legacy Music Center" className="h-[120px] w-auto object-contain" />
              <div>
                <h1 className="text-[14pt] font-bold text-black m-0 p-0 leading-tight">Legacy Music Center</h1>
                <p className="text-[10pt] text-zinc-700 m-0 p-0">Jl. Musik Harmoni No. 88, Jakarta Selatan, 12345 | Telp: (021) 555-1234</p>
              </div>
            </div>
            <h2 className="text-[14pt] font-bold text-center text-black m-0 uppercase underline decoration-2 underline-offset-4">
              Laporan Absensi Staff
            </h2>
            <p className="text-center text-[10pt] mt-1 text-black">
              Bulan {BULAN.find(b => b.value.toString() === monthFilter)?.label} {yearFilter}
            </p>
          </div>
          
          <div className="hidden print:block">
            <table className="w-full text-left border-collapse border border-black mb-8">
              <thead>
                <tr className="border-b border-black bg-zinc-100 print:bg-zinc-100">
                  <th className="py-2 px-4 border-r border-black">Nama Staff</th>
                  <th className="py-2 px-4 border-r border-black">Tanggal</th>
                  <th className="py-2 px-4 border-r border-black">Status</th>
                  <th className="py-2 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {mappedHistory.map((h, idx) => {
                  let statusLabel = 'Unknown';
                  if (h.status === 'PRESENT') statusLabel = 'Hadir';
                  else if (h.status === 'LATE') statusLabel = 'Sakit/Izin';
                  else if (h.status === 'LEAVE') statusLabel = 'Cuti';
                  else if (h.status === 'ABSENT') statusLabel = 'Absen';

                  return (
                    <tr key={h.id || idx} className="border-b border-black">
                      <td className="py-2 px-4 border-r border-black font-medium">{h.staffName}</td>
                      <td className="py-2 px-4 border-r border-black">{new Date(h.date).toLocaleDateString('en-GB')}</td>
                      <td className="py-2 px-4 border-r border-black">{statusLabel}</td>
                      <td className="py-2 px-4">{h.note || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="mt-16 text-right text-sm">
              <p>Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
              <br/><br/><br/>
              <p className="font-bold underline">HR / Admin</p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-zinc-300 text-center text-xs text-zinc-500">
              Dicetak pada {new Date().toLocaleDateString('id-ID')} • © 2026 Legacy Music Center
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>

  );
}
