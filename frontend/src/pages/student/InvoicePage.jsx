import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { CheckCircle, Clock, Receipt } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function StudentInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/student/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const columns = [
    { header: 'Bulan / Tahun', cell: (row) => `${row.month} / ${row.year}` },
    { header: 'Nominal', cell: (row) => formatCurrency(row.amount) },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          row.status === 'PAID' 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400' 
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400'
        }`}>
          {row.status === 'PAID' ? <CheckCircle size={12} /> : <Clock size={12} />}
          {row.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
        </span>
      )
    },
    {
      header: 'Tanggal Lunas',
      cell: (row) => row.paidAt ? new Date(row.paidAt).toLocaleDateString('id-ID') : '-'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl">
          <Receipt size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tagihan Saya</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Riwayat tagihan bulanan dan status pembayaran Anda.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={4} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : invoices.length === 0 ? (
        <EmptyState title="Belum Ada Tagihan" description="Kamu belum memiliki tagihan bulan ini." />
      ) : (
        <DataTable 
          columns={columns} 
          data={invoices} 
          searchKey="month" 
          searchPlaceholder="Cari bulan..." 
        />
      )}
    </div>
  );
}
