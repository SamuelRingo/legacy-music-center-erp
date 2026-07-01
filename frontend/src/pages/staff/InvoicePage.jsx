import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import ConfirmActionDialog from '../../components/shared/ConfirmActionDialog';
import { Button } from '@/components/ui/button';
import { Receipt, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [payDialogState, setPayDialogState] = useState({ open: false, invoiceId: null });
  const [isPaying, setIsPaying] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/invoices');
      setInvoices(res.data);
    } catch (error) {
      toast.error('Gagal memuat daftar tagihan');
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/staff/invoices/generate');
      toast.success(res.data.message);
      fetchData();
      setIsGenerateOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal generate tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payDialogState.invoiceId) return;
    setIsPaying(true);
    try {
      await api.post(`/staff/invoices/${payDialogState.invoiceId}/pay`);
      toast.success('Tagihan berhasil ditandai lunas!');
      fetchData();
      setPayDialogState({ open: false, invoiceId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update status pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const columns = [
    { header: 'Nama Siswa', cell: (row) => row.student?.user?.name },
    { header: 'Email', cell: (row) => row.student?.user?.email },
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
      header: 'Aksi',
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPayDialogState({ open: true, invoiceId: row.id })} 
          disabled={row.status === 'PAID'}
          className={row.status === 'PAID' ? 'opacity-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200'}
        >
          {row.status === 'PAID' ? 'Sudah Lunas' : 'Tandai Lunas'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tagihan & Pembayaran</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Kelola tagihan bulanan siswa dan status pembayaran.</p>
        </div>
        <Button 
          onClick={() => setIsGenerateOpen(true)} 
          disabled={isGenerating}
          className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg"
        >
          <Receipt size={18} />
          Generate Tagihan Bulan Ini
        </Button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={invoices} 
          searchKey="student.user.name" 
          searchPlaceholder="Cari nama siswa..." 
        />
      )}

      <ConfirmActionDialog 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen}
        title="Generate Tagihan"
        description="Apakah Anda yakin ingin menggenerate tagihan bulan ini untuk semua siswa yang aktif terdaftar di kelas? Aksi ini akan mengkalkulasi nominal berdasarkan kelas masing-masing siswa."
        confirmText="Generate Tagihan"
        onConfirm={handleGenerate}
        isProcessing={isGenerating}
      />

      <ConfirmActionDialog 
        open={payDialogState.open} 
        onOpenChange={(open) => setPayDialogState(prev => ({ ...prev, open }))}
        title="Tandai Lunas"
        description="Apakah Anda yakin ingin menandai tagihan ini sebagai LUNAS? Timestamp pembayaran akan otomatis tercatat saat ini juga."
        confirmText="Tandai Lunas"
        onConfirm={handleMarkPaid}
        isProcessing={isPaying}
      />
    </div>
  );
}
