import { useState, useCallback, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import DataTable from '../../components/shared/DataTable';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
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
  const [attendances, setAttendances] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [attRes, usersRes] = await Promise.all([
        api.get('/admin/staff-attendance', {
          params: { month: parseInt(monthFilter), year: parseInt(yearFilter) }
        }),
        api.get('/admin/users')
      ]);
      setAttendances(attRes.data.attendances || attRes.data);
      
      const filteredUsers = (usersRes.data.users || usersRes.data).filter(u => u.role === 'STAFF' || u.role === 'TEACHER');
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(true);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [modal, setModal] = useState({ open: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    note: ''
  });

  const handleOpenModal = () => {
    setForm({
      userId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      note: ''
    });
    setModal({ open: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) return toast.error('Pilih staff terlebih dahulu');
    setIsSubmitting(true);
    try {
      await api.post('/admin/staff-attendance', form);
      toast.success('Absensi berhasil dicatat');
      setModal({ open: false });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat absensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Nama',
      cell: (row) => (
        <div className="font-medium">{row.user?.name || '-'}</div>
      )
    },
    {
      header: 'Role',
      cell: (row) => <span className="text-xs text-zinc-500">{row.user?.role || '-'}</span>
    },
    {
      header: 'Tanggal',
      cell: (row) => new Date(row.date).toLocaleDateString('id-ID')
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          row.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
          row.status === 'LATE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.status}
        </span>
      )
    },
    { header: 'Catatan', accessorKey: 'note' }
  ];

  const metrics = {
    present: attendances.filter(a => a.status === 'PRESENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
  };

  if (loading && !attendances.length && !users.length) return (
    <DashboardLayout>
      <div className="space-y-6">
        <LoadingSkeleton type="card" rows={3} gridClassName="grid grid-cols-1 md:grid-cols-3 gap-4" />
        <LoadingSkeleton type="table" rows={5} columns={5} />
      </div>
    </DashboardLayout>
  );
  if (error && !attendances.length) return <DashboardLayout><ErrorState onRetry={fetchData} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Absensi Staff</h1>
            <p className="text-sm text-zinc-500">Rekap kehadiran harian guru dan staff</p>
          </div>
          <Button onClick={handleOpenModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Catat Absensi
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Hadir (Present)" value={metrics.present} icon={CheckCircle} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-900/30" />
          <MetricCard title="Terlambat (Late)" value={metrics.late} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-100 dark:bg-amber-900/30" />
          <MetricCard title="Absen (Absent)" value={metrics.absent} icon={XCircle} colorClass="text-rose-600" bgClass="bg-rose-100 dark:bg-rose-900/30" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Absensi</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Bulan">{monthFilter ? BULAN.find(b => b.value.toString() === monthFilter)?.label : "Bulan"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BULAN.map((b) => (
                    <SelectItem key={b.value} value={b.value.toString()}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Tahun">{yearFilter || "Tahun"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={attendances || []} searchKey="note" searchPlaceholder="Cari catatan..." searchable={true} />
          </CardContent>
        </Card>

        <Dialog open={modal.open} onOpenChange={(val) => !val && setModal({open: false})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Catat Kehadiran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Staff/Guru</Label>
                <Select value={form.userId} onValueChange={(val) => setForm({...form, userId: val})}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status Kehadiran</Label>
                <Select value={form.status} onValueChange={(val) => setForm({...form, status: val})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Hadir (Present)</SelectItem>
                    <SelectItem value="LATE">Terlambat (Late)</SelectItem>
                    <SelectItem value="ABSENT">Absen (Absent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input placeholder="Contoh: Izin sakit, macet di jalan..." value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModal({open: false})}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
