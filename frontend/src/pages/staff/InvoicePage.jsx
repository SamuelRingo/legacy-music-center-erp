import { useState, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../lib/api';
import { formatRupiah } from '../../lib/utils';
import DataTable from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { Button } from '@/components/ui/button';
import { Receipt, CheckCircle, Clock, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useDashboardCache } from '../../context/DashboardContext';
import { useCachedQuery, clearCache } from '../../lib/cache';

export default function InvoicePage() {
  const { clearDashboardCache } = useDashboardCache();
  const fetchInvoicesFn = useCallback(async () => {
    const res = await api.get('/staff/invoices');
    return res.data;
  }, []);
  const { data: invoicesData, loading, error, refetch: fetchData } = useCachedQuery('staff_invoices', fetchInvoicesFn);
  const invoices = invoicesData || [];
  
  // Modal States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const printRef = useRef();
  
  const handlePrintAction = useReactToPrint({
    content: () => printRef.current,
  });

  const onPrintClick = (invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(handlePrintAction, 50);
  };

  
  const [payDialogState, setPayDialogState] = useState({ open: false, invoiceId: null });
  const [isPaying, setIsPaying] = useState(false);

  const [deleteDialogState, setDeleteDialogState] = useState({ open: false, invoiceId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/staff/invoices/generate');
      clearDashboardCache('staff');
      clearDashboardCache('admin');
      clearCache('staff_invoices');
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
      clearDashboardCache('staff');
      clearDashboardCache('admin');
      clearCache('staff_invoices');
      toast.success('Tagihan berhasil ditandai lunas!');
      fetchData();
      setPayDialogState({ open: false, invoiceId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update status pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteDialogState.invoiceId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/staff/invoices/${deleteDialogState.invoiceId}`);
      clearCache('staff_invoices');
      toast.success('Tagihan berhasil dihapus!');
      fetchData();
      setDeleteDialogState({ open: false, invoiceId: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus tagihan');
    } finally {
      setIsDeleting(false);
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
        <ActionMenu
          actions={[
            row.status === 'PAID' && { label: 'Cetak Bukti Bayar', icon: Printer, onClick: () => onPrintClick(row) },
            row.status !== 'PAID' && { label: 'Tandai Lunas', icon: CheckCircle, onClick: () => setPayDialogState({ open: true, invoiceId: row.id }) },
            row.status !== 'PAID' && { label: 'Hapus', icon: Trash2, onClick: () => setDeleteDialogState({ open: true, invoiceId: row.id }), isDanger: true }
          ].filter(Boolean)}
        />
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
        <LoadingSkeleton type="table" rows={5} />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : invoices.length === 0 ? (
        <EmptyState title="Belum Ada Tagihan" description="Klik 'Generate Tagihan Bulan Ini' untuk membuat tagihan baru." />
      ) : (
        <DataTable 
          columns={columns} 
          data={invoices} 
          searchKey="student.user.name" 
          searchPlaceholder="Cari nama siswa..." 
        />
      )}

      <ConfirmDialog 
        open={isGenerateOpen} 
        onOpenChange={setIsGenerateOpen}
        title="Generate Tagihan"
        description="Apakah Anda yakin ingin menggenerate tagihan bulan ini untuk semua siswa yang aktif terdaftar di kelas? Aksi ini akan mengkalkulasi nominal berdasarkan kelas masing-masing siswa."
        confirmText="Generate Tagihan"
        onConfirm={handleGenerate}
        isProcessing={isGenerating}
      />

      <ConfirmDialog
        open={payDialogState.open}
        onOpenChange={open => !open && setPayDialogState({ open: false, invoiceId: null })}
        title="Tandai Lunas"
        description="Apakah Anda yakin ingin menandai tagihan ini sebagai lunas? Tindakan ini tidak dapat dibatalkan."
        variant="default"
        confirmText="Tandai Lunas"
        onConfirm={handleMarkPaid}
        isProcessing={isPaying}
      />

      <ConfirmDialog
        open={deleteDialogState.open}
        onOpenChange={open => !open && setDeleteDialogState({ open: false, invoiceId: null })}
        title="Hapus Tagihan"
        description="Apakah Anda yakin ingin menghapus tagihan ini? Tindakan ini permanen."
        variant="danger"
        confirmText="Hapus Tagihan"
        onConfirm={handleDeleteInvoice}
        isProcessing={isDeleting}
      />

      {/* HIDDEN PRINT COMPONENT */}
      <div className="hidden">
        <div ref={printRef} className="print:p-0 print:bg-white print:text-black print:text-[12pt] print:w-full print:max-w-full print:overflow-hidden p-8">
          <style type="text/css" media="print">
            {`
              @page { size: A4; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            `}
          </style>
          {invoiceToPrint && (
            <div>
              <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/Logolegacymusic.webp" alt="Legacy Music Center" className="h-[180px] w-auto object-contain" />
                  <div>
                    <h1 className="text-[14pt] font-bold text-black m-0 p-0 leading-tight">Legacy Music Center</h1>
                    <p className="text-[10pt] text-zinc-700 m-0 p-0">Jl. Musik Harmoni No. 88, Jakarta Selatan, 12345 | Telp: (021) 555-1234</p>
                  </div>
                </div>
                <h2 className="text-[14pt] font-bold text-center text-black m-0 uppercase underline decoration-2 underline-offset-4">
                  Bukti Pembayaran
                </h2>
                <p className="text-center text-[10pt] mt-1 text-black">No. Referensi: {invoiceToPrint.id}</p>
              </div>
              
              <div className="mb-8 mt-6">
                <p><strong>Nama Siswa:</strong> {invoiceToPrint.student?.user?.name}</p>
                <p><strong>Bulan:</strong> {invoiceToPrint.month}</p>
                <p><strong>Tahun:</strong> {invoiceToPrint.year}</p>
                <p><strong>Status:</strong> {invoiceToPrint.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</p>
                {invoiceToPrint.paidAt && (
                  <p><strong>Tanggal Lunas:</strong> {new Date(invoiceToPrint.paidAt).toLocaleDateString('id-ID')}</p>
                )}
              </div>
              
              <table className="w-full text-left mb-8 border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-zinc-100 print:bg-zinc-100">
                    <th className="py-2 px-4 border-r border-black">Deskripsi</th>
                    <th className="py-2 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="py-4 px-4 border-r border-black">Pembayaran Biaya SPP / Kursus Musik</td>
                    <td className="py-4 px-4 text-right font-medium">{formatRupiah(invoiceToPrint.amount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-4 px-4 font-bold text-lg border-r border-black">Total Pembayaran</td>
                    <td className="py-4 px-4 text-right font-bold text-lg">{formatRupiah(invoiceToPrint.amount)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="hidden print:flex mt-12 pt-4 border-t-2 border-black text-[10pt] text-zinc-700 justify-between items-center break-inside-avoid">
                <div className="w-1/3 text-left">
                  Dicetak pada {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="w-1/3 text-center">© {new Date().getFullYear()} Legacy Music Center</div>
                <div className="w-1/3 text-right">Lembar 1/1</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
