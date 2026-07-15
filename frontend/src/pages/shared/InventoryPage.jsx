import { useState, useCallback } from 'react';
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
import { Plus, Edit2, Box, PackageOpen, AlertTriangle } from 'lucide-react';
import DataTable from '../../components/shared/DataTable';
import MetricCard from '../../components/shared/MetricCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import { ActionMenu } from '../../components/shared/ActionMenu';
import { toast } from 'sonner';

export default function InventoryPage() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const apiPrefix = isAdmin ? '/admin' : '/staff';

  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInventory = useCallback(async () => {
    const res = await api.get(`${apiPrefix}/inventory`);
    return res.data;
  }, [apiPrefix]);

  const { data: inventory, loading, error, refetch } = useCachedQuery(
    `inventory_${apiPrefix}`, 
    fetchInventory
  );

  const [modal, setModal] = useState({ open: false, item: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'INSTRUMENT',
    status: 'AVAILABLE',
    quantity: '1',
    description: ''
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setForm({
        name: item.name,
        category: item.category,
        status: item.status,
        quantity: item.quantity.toString(),
        description: item.description || ''
      });
    } else {
      setForm({
        name: '',
        category: 'INSTRUMENT',
        status: 'AVAILABLE',
        quantity: '1',
        description: ''
      });
    }
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, quantity: parseInt(form.quantity) };
      if (modal.item) {
        await api.put(`${apiPrefix}/inventory/${modal.item.id}`, payload);
        toast.success('Barang berhasil diperbarui');
      } else {
        await api.post(`${apiPrefix}/inventory`, payload);
        toast.success('Barang berhasil ditambahkan');
      }
      clearCache(`inventory_${apiPrefix}`);
      setModal({ open: false, item: null });
      refetch();
    } catch (err) {
      toast.error('Gagal menyimpan barang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = inventory ? inventory.filter(item => statusFilter === 'ALL' || item.status === statusFilter) : [];

  const metrics = {
    total: inventory?.length || 0,
    available: inventory?.filter(i => i.status === 'AVAILABLE').length || 0,
    damaged: inventory?.filter(i => i.status === 'DAMAGED').length || 0,
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      AVAILABLE: 'bg-emerald-100 text-emerald-700',
      DAMAGED: 'bg-red-100 text-red-700',
      NEW: 'bg-blue-100 text-blue-700'
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status]}`}>{status}</span>;
  };

  const columns = [
    { header: 'Nama Barang', accessorKey: 'name' },
    { header: 'Kategori', accessorKey: 'category' },
    { header: 'Jumlah', accessorKey: 'quantity' },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    { header: 'Keterangan', accessorKey: 'description', cell: (row) => row.description || '-' },
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

  if (loading && !inventory) return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" rows={1} />
          <LoadingSkeleton type="card" rows={1} />
          <LoadingSkeleton type="card" rows={1} />
        </div>
        <LoadingSkeleton type="table" rows={5} columns={6} />
      </div>
    </DashboardLayout>
  );
  if (error && !inventory) return <DashboardLayout><ErrorState onRetry={refetch} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manajemen Barang</h1>
            <p className="text-sm text-zinc-500">Inventaris alat musik dan kelengkapan sekolah</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
            <Plus className="w-4 h-4 mr-2" /> Tambah Barang
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total Item Unik" value={metrics.total} icon={Box} />
          <MetricCard title="Tersedia (Available)" value={metrics.available} icon={PackageOpen} trend={{ value: 'GOOD', isPositive: true }} />
          <MetricCard title="Rusak (Damaged)" value={metrics.damaged} icon={AlertTriangle} trend={{ value: 'ATTENTION', isPositive: false }} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Inventaris</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredData} searchKey="name" searchable={true} />
          </CardContent>
        </Card>

        <Dialog open={modal.open} onOpenChange={(open) => !open && setModal({ open: false, item: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modal.item ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Barang</Label>
                <Input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={form.category} onValueChange={(val) => setForm({...form, category: val})}>
                    <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INSTRUMENT">Alat Musik (Instrument)</SelectItem>
                      <SelectItem value="EQUIPMENT">Perlengkapan (Equipment)</SelectItem>
                      <SelectItem value="FURNITURE">Mebel (Furniture)</SelectItem>
                      <SelectItem value="OTHER">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah</Label>
                  <Input type="number" required min="1" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(val) => setForm({...form, status: val})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Tersedia (Available)</SelectItem>
                    <SelectItem value="NEW">Baru (New)</SelectItem>
                    <SelectItem value="DAMAGED">Rusak (Damaged)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input placeholder="Detail tambahan (opsional)" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModal({ open: false, item: null })}>Batal</Button>
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
