import { useState, useCallback, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, DollarSign, Edit2 } from 'lucide-react';
import DataTable from '../../components/shared/DataTable';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { formatRupiah } from '../../lib/utils';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { toast } from 'sonner';

const BULAN = [
  { value: 1, label: 'Januari' }, { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' }, { value: 4, label: 'April' },
  { value: 5, label: 'Mei' }, { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' }, { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' }, { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' }, { value: 12, label: 'Desember' }
];

export default function StaffSalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [salRes, usersRes] = await Promise.all([
        api.get('/admin/staff-salaries', {
          params: { month: parseInt(monthFilter), year: parseInt(yearFilter) }
        }),
        api.get('/admin/users')
      ]);
      setSalaries(salRes.data.salaries || salRes.data);
      
      const filteredUsers = (usersRes.data.users || usersRes.data).filter(u => u.role === 'STAFF' || u.role === 'TEACHER');
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(true);
      toast.error('Gagal memuat data gaji');
    } finally {
      setLoading(false);
    }
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [modal, setModal] = useState({ open: false, item: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    userId: '',
    month: (new Date().getMonth() + 1).toString(),
    year: new Date().getFullYear().toString(),
    amount: '',
    bonus: '0',
    note: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({
        userId: item.userId,
        month: item.month.toString(),
        year: item.year.toString(),
        amount: item.amount.toString(),
        bonus: item.bonus.toString(),
        note: item.note || ''
      });
    } else {
      setForm({
        userId: '',
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        amount: '',
        bonus: '0',
        note: ''
      });
    }
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) return toast.error('Pilih staff terlebih dahulu');
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        month: parseInt(form.month),
        year: parseInt(form.year),
        amount: parseFloat(form.amount),
        bonus: parseFloat(form.bonus)
      };

      await api.post('/admin/staff-salaries', payload);
      toast.success(modal.item ? 'Gaji berhasil diperbarui' : 'Gaji berhasil dicatat');
      setModal({ open: false, item: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data gaji');
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
      header: 'Bulan / Tahun',
      cell: (row) => `${BULAN.find(b => b.value === row.month)?.label || row.month} ${row.year}`
    },
    {
      header: 'Gaji Pokok',
      className: 'text-right',
      cell: (row) => <span className="font-medium">{formatRupiah(row.amount)}</span>
    },
    {
      header: 'Bonus',
      className: 'text-right',
      cell: (row) => <span className="text-emerald-600">+{formatRupiah(row.bonus)}</span>
    },
    {
      header: 'Total Gaji',
      className: 'text-right font-bold',
      cell: (row) => formatRupiah(row.amount + row.bonus)
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <ActionMenu
          actions={[
            { label: 'Edit', icon: Edit2, onClick: () => handleOpenModal(row) }
          ]}
        />
      )
    }
  ];

  const metrics = {
    totalPaid: salaries.reduce((sum, s) => sum + (s.amount + s.bonus), 0),
    totalStaff: new Set(salaries.map(s => s.userId)).size
  };

  if (loading && !salaries.length && !users.length) return (
    <DashboardLayout>
      <div className="space-y-6">
        <LoadingSkeleton type="card" rows={2} gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4" />
        <LoadingSkeleton type="table" rows={5} columns={7} />
      </div>
    </DashboardLayout>
  );
  if (error && !salaries.length) return <DashboardLayout><ErrorState onRetry={fetchData} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gaji Staff</h1>
            <p className="text-sm text-zinc-500">Kelola dan pantau pengeluaran kompensasi</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Catat Gaji
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard title="Total Pengeluaran Gaji" value={formatRupiah(metrics.totalPaid)} icon={DollarSign} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-900/30" />
          <MetricCard title="Staff Digaji Bulan Ini" value={metrics.totalStaff} icon={DollarSign} colorClass="text-indigo-600" bgClass="bg-indigo-100 dark:bg-indigo-900/30" />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Penggajian</CardTitle>
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
            <DataTable columns={columns} data={salaries || []} searchKey="note" searchPlaceholder="Cari catatan..." searchable={true} />
          </CardContent>
        </Card>

        <Dialog open={modal.open} onOpenChange={(val) => !val && setModal({open: false, item: null})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal.item ? 'Edit Gaji Staff' : 'Catat Gaji Staff'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Staff/Guru</Label>
                <Select value={form.userId} onValueChange={(val) => setForm({...form, userId: val})} disabled={!!modal.item}>
                  <SelectTrigger><SelectValue placeholder="Pilih...">{form.userId ? users.find(u => u.id === form.userId)?.name : "Pilih..."}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bulan</Label>
                  <Select value={form.month} onValueChange={(val) => setForm({...form, month: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bulan">{form.month ? BULAN.find(b => b.value.toString() === form.month)?.label : "Bulan"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {BULAN.map((b) => (
                        <SelectItem key={b.value} value={b.value.toString()}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
                  <Select value={form.year} onValueChange={(val) => setForm({...form, year: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tahun">{form.year || "Tahun"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gaji Pokok (Rp)</Label>
                <Input type="number" required min="1" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
                {form.amount && <p className="text-xs text-zinc-500 mt-1">{formatRupiah(form.amount)}</p>}
              </div>

              <div className="space-y-2">
                <Label>Bonus (Rp) - Opsional</Label>
                <Input type="number" min="0" value={form.bonus} onChange={(e) => setForm({...form, bonus: e.target.value})} />
                {form.bonus && form.bonus !== '0' && <p className="text-xs text-zinc-500 mt-1">+{formatRupiah(form.bonus)}</p>}
              </div>

              <div className="space-y-2">
                <Label>Catatan Tambahan (Opsional)</Label>
                <Input placeholder="Contoh: Pembayaran Gaji Juli + Lembur" value={form.note} onChange={(e) => setForm({...form, note: e.target.value})} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModal({open: false, item: null})}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
