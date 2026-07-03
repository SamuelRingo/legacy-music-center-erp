import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, TrendingUp, Users, BookOpen, Receipt, DollarSign, AlertCircle, CheckCircle, Clock, Briefcase, CheckSquare } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('finance');
  const [financeData, setFinanceData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const printRef = useRef();

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [finRes, acadRes] = await Promise.all([
        api.get('/staff/reports/finance'),
        api.get('/staff/reports/academic')
      ]);
      setFinanceData(finRes.data);
      setAcademicData(acadRes.data);
    } catch (err) {
      setError(true);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Laporan_${activeTab === 'finance' ? 'Keuangan' : 'Akademik'}`,
  });

  const pieColors = ['#10b981', '#ef4444']; // emerald-500, red-500

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" rows={4} />
        <LoadingSkeleton type="table" rows={3} />
      </div>
    );
  }

  if (error || !financeData || !academicData) {
    return <ErrorState onRetry={fetchData} />;
  }

  const pieData = [
    { name: 'Lunas', value: financeData.paidCount },
    { name: 'Belum Lunas', value: financeData.unpaidCount }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Laporan Sistem</h1>
          <p className="text-sm text-zinc-500">Pantau performa keuangan dan akademik</p>
        </div>
        <Button onClick={handlePrint} className="gap-2 print:hidden bg-indigo-600 hover:bg-indigo-700 text-white">
          <Printer size={16} /> Cetak Laporan
        </Button>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 print:hidden">
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finance' ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-500'}`}
        >
          Keuangan
        </button>
        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'academic' ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-500'}`}
        >
          Akademik
        </button>
      </div>

      {/* Printable Area */}
      <div ref={printRef} className="print:p-8 print:bg-white print:text-black print:text-[12px]">
        <style type="text/css" media="print">
          {`
            .recharts-text { font-size: 10px !important; }
            .recharts-legend-item-text { font-size: 10px !important; }
          `}
        </style>
        {/* Header (Hanya muncul saat print) */}
        <div className="hidden print:block mb-8 print:mb-4 border-b pb-4 print:pb-2">
          <h1 className="text-3xl print:text-2xl font-bold">Legacy Musik</h1>
          <p className="text-lg print:text-base">Laporan {activeTab === 'finance' ? 'Keuangan' : 'Akademik'}</p>
        </div>

        {activeTab === 'finance' && (
          <div className="space-y-6 print:space-y-2">
            {/* Finance Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-3 print:break-inside-avoid">
              <MetricCard 
                title="Total Pemasukan" 
                value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(financeData.totalRevenue || 0)} 
                icon={DollarSign} 
                variant="success" 
              />
              <MetricCard 
                title="Total Piutang" 
                value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(financeData.totalReceivable || 0)} 
                icon={AlertCircle} 
                variant="danger" 
              />
              <MetricCard 
                title="Invoice Lunas" 
                value={financeData.paidCount} 
                icon={CheckCircle} 
                variant="success" 
              />
              <MetricCard 
                title="Invoice Belum Lunas" 
                value={financeData.unpaidCount} 
                icon={Clock} 
                variant="danger" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4">
              <Card className="lg:col-span-2 print:col-span-1">
                <CardHeader className="flex flex-row items-center justify-center gap-2 pb-6 print:pb-2 space-y-0 border-b mb-4 print:mb-2">
                  <TrendingUp size={20} className="text-emerald-500 print:w-4 print:h-4" />
                  <CardTitle className="text-lg print:text-base m-0 text-center">Tren Pendapatan</CardTitle>
                </CardHeader>
                <CardContent className="h-80 print:h-[250px] pb-6 print:pb-2">
                  {financeData.revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={financeData.revenueTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `Rp ${val / 1000}k`} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400">Belum ada data pendapatan</div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-1 print:col-span-1">
                <CardHeader className="flex flex-row items-center justify-center gap-2 pb-6 print:pb-2 space-y-0 border-b mb-4 print:mb-2">
                  <Receipt size={20} className="text-amber-500 print:w-4 print:h-4" />
                  <CardTitle className="text-lg print:text-base m-0 text-center">Status Tagihan</CardTitle>
                </CardHeader>
                <CardContent className="h-80 print:h-[250px] pb-6 print:pb-2">
                  {(financeData.paidCount > 0 || financeData.unpaidCount > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} label dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400">Belum ada data tagihan</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-6 print:space-y-2">
            {/* Academic Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-3 print:break-inside-avoid">
              <MetricCard 
                title="Total Siswa Aktif" 
                value={academicData.totalActiveStudents} 
                icon={Users} 
                variant="info" 
              />
              <MetricCard 
                title="Total Pengajar" 
                value={academicData.totalTeachers} 
                icon={Briefcase} 
                variant="info" 
              />
              <MetricCard 
                title="Kelas Berjalan" 
                value={academicData.activeClasses} 
                icon={BookOpen} 
                variant="warning" 
              />
              <MetricCard 
                title="Rata-rata Kehadiran" 
                value={`${academicData.attendancePercentage}%`} 
                icon={CheckSquare} 
                variant="warning" 
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-center gap-2 pb-6 print:pb-2 space-y-0 border-b mb-4 print:mb-2">
                <BookOpen size={20} className="text-blue-500 print:w-4 print:h-4" />
                <CardTitle className="text-lg print:text-base m-0 text-center">Kursus Paling Diminati</CardTitle>
              </CardHeader>
              <CardContent className="h-80 print:h-[250px]">
                {academicData.coursePopularity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={academicData.coursePopularity} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="enrollments" name="Jumlah Siswa" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400">Belum ada data kursus</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
