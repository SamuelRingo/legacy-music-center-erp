import { useState, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { CheckCircle, Clock, Receipt, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useCachedQuery } from '../../lib/cache';

export default function StudentInvoicePage() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const printRef = useRef();

  const handlePrintAction = useReactToPrint({
    content: () => printRef.current,
  });

  const onPrintClick = (invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(handlePrintAction, 50);
  };

  const fetchInvoicesFn = useCallback(async () => {
    const res = await api.get('/student/invoices');
    return res.data;
  }, []);

  const { data: invoicesData, loading, error, refetch: fetchData } = useCachedQuery('student_invoices', fetchInvoicesFn, 60000);
  const invoices = invoicesData || [];

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
    },
    {
      header: 'Aksi',
      cell: (row) => row.status === 'PAID' ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          onClick={() => onPrintClick(row)}
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak Bukti Bayar
        </Button>
      ) : '-'
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
                  <img src="/Logolegacymusic.webp" alt="Legacy Music Center" className="h-[120px] w-auto object-contain" />
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
              
              <div className="mb-8 mt-6 text-black">
                <p><strong>Nama Siswa:</strong> {user?.name}</p>
                <p><strong>Bulan:</strong> {invoiceToPrint.month}</p>
                <p><strong>Tahun:</strong> {invoiceToPrint.year}</p>
                <p><strong>Status:</strong> {invoiceToPrint.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</p>
                {invoiceToPrint.paidAt && (
                  <p><strong>Tanggal Lunas:</strong> {new Date(invoiceToPrint.paidAt).toLocaleDateString('id-ID')}</p>
                )}
              </div>
              
              <table className="w-full text-left mb-8 border-collapse border border-black text-black">
                <thead>
                  <tr className="border-b border-black bg-zinc-100 print:bg-zinc-100">
                    <th className="py-2 px-4 border-r border-black">Deskripsi</th>
                    <th className="py-2 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="py-4 px-4 border-r border-black">Pembayaran Biaya SPP / Kursus Musik</td>
                    <td className="py-4 px-4 text-right font-medium">{formatCurrency(invoiceToPrint.amount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-4 px-4 font-bold text-lg border-r border-black">Total Pembayaran</td>
                    <td className="py-4 px-4 text-right font-bold text-lg">{formatCurrency(invoiceToPrint.amount)}</td>
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
