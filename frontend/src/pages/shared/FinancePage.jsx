import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { Plus, Wallet, TrendingUp, TrendingDown, Edit2, Printer } from 'lucide-react';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { formatRupiah } from '../../lib/utils';
import { useReactToPrint } from 'react-to-print';
import DataTable from '../../components/shared/DataTable';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { toast } from 'sonner';

import MonthYearFilter, { BULAN } from '../../components/shared/MonthYearFilter';
import useFooterData from '../../hooks/useFooterData';

export default function FinancePage() {
  const footer = useFooterData();
  const location = useLocation();
  
  const isAdmin = location.pathname.startsWith('/admin');
  const apiPrefix = isAdmin ? '/admin' : '/staff';

  const [monthFilter, setMonthFilter] = useState((new Date().getMonth() + 1).toString());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Laporan_Transaksi_${monthFilter}_${yearFilter}`,
  });

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
        <LoadingSkeleton type="card" rows={3} gridClassName="grid grid-cols-1 md:grid-cols-3 gap-4" />
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="border-zinc-200">
              <Printer className="w-4 h-4 mr-2" /> Cetak Transaksi
            </Button>
            <Button onClick={() => handleOpenModal()} className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
              <Plus className="w-4 h-4 mr-2" /> Transaksi Baru
            </Button>
          </div>
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
              <MonthYearFilter 
                monthFilter={monthFilter} 
                yearFilter={yearFilter} 
                onMonthChange={setMonthFilter} 
                onYearChange={setYearFilter} 
              />
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
              <img src="/logo.png" alt="Legacy Music Center" className="h-[120px] w-auto object-contain" />
              <div>
                <h1 className="text-[14pt] font-bold text-black m-0 p-0 leading-tight">Legacy Music Center</h1>
                <p className="text-[10pt] text-zinc-700 m-0 p-0">{footer.address} | Telp: {footer.phone}</p>
              </div>
            </div>
            <h2 className="text-[14pt] font-bold text-center text-black m-0 uppercase underline decoration-2 underline-offset-4">
              Laporan Transaksi Kas
            </h2>
            <p className="text-center text-[10pt] mt-1 text-black">
              Periode: {BULAN.find(b => b.value.toString() === monthFilter)?.label} {yearFilter}
            </p>
          </div>
          
          <div className="hidden print:block">
            <table className="w-full text-left border-collapse border border-black mb-8">
              <thead>
                <tr className="border-b border-black bg-zinc-100 print:bg-zinc-100">
                  <th className="py-2 px-4 border-r border-black">Tanggal</th>
                  <th className="py-2 px-4 border-r border-black">Kategori</th>
                  <th className="py-2 px-4 border-r border-black">Deskripsi</th>
                  <th className="py-2 px-4 border-r border-black">Jenis</th>
                  <th className="py-2 px-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={t.id || idx} className="border-b border-black">
                    <td className="py-2 px-4 border-r border-black">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                    <td className="py-2 px-4 border-r border-black">{t.category}</td>
                    <td className="py-2 px-4 border-r border-black">{t.description || '-'}</td>
                    <td className="py-2 px-4 border-r border-black">{t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td className="py-2 px-4 text-right font-medium">{formatRupiah(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan="4" className="py-2 px-4 border-r border-black text-right">Total Pemasukan</td>
                  <td className="py-2 px-4 text-right text-green-700 print:text-black">{formatRupiah(metrics.income)}</td>
                </tr>
                <tr className="border-t border-black font-bold">
                  <td colSpan="4" className="py-2 px-4 border-r border-black text-right">Total Pengeluaran</td>
                  <td className="py-2 px-4 text-right text-red-700 print:text-black">{formatRupiah(metrics.expense)}</td>
                </tr>
                <tr className="border-t border-black font-bold">
                  <td colSpan="4" className="py-2 px-4 border-r border-black text-right">Saldo Akhir</td>
                  <td className="py-2 px-4 text-right">{formatRupiah(metrics.total)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="mt-16 text-right text-sm">
              <p>Jakarta, {new Date().toLocaleDateString('id-ID')}</p>
              <br/><br/><br/>
              <p className="font-bold underline">Admin Finance</p>
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
