import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { useCachedQuery, clearCache } from '../../lib/cache';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Wallet, TrendingUp, TrendingDown, Edit2 } from 'lucide-react';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { formatRupiah } from '../../lib/utils';
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

export default function FinancePage() {
  const location = useLocation();
  
  const isAdmin = location.pathname.startsWith('/admin');
  const apiPrefix = isAdmin ? '/admin' : '/staff';

  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`${apiPrefix}/transactions`, {
        params: {
          month: parseInt(monthFilter),
          year: parseInt(yearFilter)
        }
      });
      console.log('Fetched data:', res.data);
      setTransactions(res.data.transactions || res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(true);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [apiPrefix, monthFilter, yearFilter]);

  useEffect(() => {
    console.log('Fetching transactions for month:', monthFilter, 'year:', yearFilter);
    fetchTransactions();
  }, [fetchTransactions]);

  const refetch = fetchTransactions;

  const [modal, setModal] = useState({ open: false, item: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: 'INCOME',
    amount: '',
    category: 'SPP',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({
        type: item.type,
        amount: item.amount.toString(),
        category: item.category,
        description: item.description || '',
        date: new Date(item.date).toISOString().split('T')[0]
      });
    } else {
      setForm({
        type: 'INCOME',
        amount: '',
        category: 'SPP',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        date: new Date(form.date)
      };
      if (modal.item) {
        await api.put(`${apiPrefix}/transactions/${modal.item.id}`, payload);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await api.post(`${apiPrefix}/transactions`, payload);
        toast.success('Transaksi berhasil dicatat');
      }
      clearCache(`finance_${apiPrefix}_${monthFilter}_${yearFilter}`);
      setModal({ open: false, item: null });
      setForm({
        type: 'INCOME',
        amount: '',
        category: 'SPP',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (err) {
      toast.error('Gagal mencatat transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, total: 0 };
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'INCOME') income += t.amount;
      if (t.type === 'EXPENSE') expense += t.amount;
    });
    return { income, expense, total: income - expense };
  }, [transactions]);

  const columns = [
    {
      header: 'Tanggal',
      cell: (row) => new Date(row.date).toLocaleDateString('id-ID')
    },
    {
      header: 'Tipe',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          row.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}>
          {row.type}
        </span>
      )
    },
    { header: 'Kategori', accessorKey: 'category' },
    { header: 'Keterangan', accessorKey: 'description' },
    {
      header: 'Jumlah',
      className: 'text-right',
      cell: (row) => (
        <span className={`font-medium ${row.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.type === 'INCOME' ? '+' : '-'} {formatRupiah(row.amount)}
        </span>
      )
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

  if (loading && !transactions) return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" rows={1} />
          <LoadingSkeleton type="card" rows={1} />
          <LoadingSkeleton type="card" rows={1} />
        </div>
        <LoadingSkeleton type="table" rows={5} columns={5} />
      </div>
    </DashboardLayout>
  );
  if (error && !transactions) return <DashboardLayout><ErrorState onRetry={refetch} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Transaksi Kas</h1>
            <p className="text-sm text-zinc-500">Pencatatan manual arus kas sekolah</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
            <Plus className="w-4 h-4 mr-2" /> Transaksi Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total Pemasukan" value={formatRupiah(metrics.income)} icon={TrendingUp} trend={{ value: 'INCOME', isPositive: true }} />
          <MetricCard title="Total Pengeluaran" value={formatRupiah(metrics.expense)} icon={TrendingDown} trend={{ value: 'EXPENSE', isPositive: false }} />
          <MetricCard title="Saldo Bulan Ini" value={formatRupiah(metrics.total)} icon={Wallet} trend={{ value: 'SALDO', isPositive: metrics.total >= 0 }} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Bulan">{monthFilter ? BULAN.find(b => b.value.toString() === monthFilter)?.label : "Bulan"}</SelectValue></SelectTrigger>
                <SelectContent>
                  {BULAN.map((b) => (
                    <SelectItem key={b.value} value={b.value.toString()}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-24"><SelectValue placeholder="Tahun" /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={transactions || []} searchKey="description" searchable={true} />
          </CardContent>
        </Card>

        <Dialog open={modal.open} onOpenChange={(val) => !val && setModal({open:false, item:null})}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal.item ? 'Edit Transaksi Kas' : 'Catat Transaksi Kas'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe Transaksi</Label>
                  <Select value={form.type} onValueChange={(val) => setForm({...form, type: val})}>
                    <SelectTrigger><SelectValue placeholder="Tipe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Pemasukan (INCOME)</SelectItem>
                      <SelectItem value="EXPENSE">Pengeluaran (EXPENSE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input type="number" required min="1" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} />
                {form.amount && <p className="text-xs text-zinc-500 mt-1">{formatRupiah(form.amount)}</p>}
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                  <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPP">SPP / Uang Kursus</SelectItem>
                    <SelectItem value="OPERATIONAL">Operasional</SelectItem>
                    <SelectItem value="MAINTENANCE">Pemeliharaan</SelectItem>
                    <SelectItem value="SALARY">Gaji</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input placeholder="Contoh: Pembayaran listrik bulan ini" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModal({open:false, item:null})}>Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
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
