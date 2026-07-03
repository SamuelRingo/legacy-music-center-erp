import { useState, useEffect } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus } from 'lucide-react';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [formData, setFormData] = useState({ name: '', capacity: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/admin/classrooms');
      setClassrooms(res.data);
    } catch (err) {
      setError(true);
      toast.error('Gagal memuat ruang kelas');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, data = null) => {
    setModal({ open: true, mode, data });
    setFormData(data ? { name: data.name, capacity: data.capacity.toString() } : { name: '', capacity: '' });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name: formData.name, capacity: parseInt(formData.capacity) || 0 };
      if (modal.mode === 'create') {
        await api.post('/admin/classrooms', payload);
        toast.success('Ruang kelas berhasil ditambahkan');
      } else {
        await api.put(`/admin/classrooms/${modal.data.id}`, payload);
        toast.success('Ruang kelas berhasil diperbarui');
      }
      closeModal();
      fetchClassrooms();
    } catch (err) {
      toast.error('Gagal menyimpan ruang kelas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/classrooms/${deleteConfirm.id}`);
      toast.success('Ruang kelas dihapus');
      fetchClassrooms();
    } catch (err) {
      toast.error('Gagal menghapus ruang kelas (Mungkin sedang digunakan jadwal)');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    { header: 'Nama Ruangan', accessorKey: 'name' },
    { header: 'Kapasitas', accessorKey: 'capacity' },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <ActionMenu
          actions={[
            { label: 'Edit', icon: Edit2, onClick: () => openModal('edit', row) },
            { label: 'Hapus', icon: Trash2, onClick: () => setDeleteConfirm({ open: true, id: row.id }), isDanger: true }
          ]}
        />
      )
    }
  ];

  const actionButton = (
    <Button onClick={() => openModal('create')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
      <Plus size={16} /> Tambah Ruangan
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manajemen Ruang Kelas</h1>
        <p className="text-sm text-zinc-500">Kelola daftar ruang kelas beserta kapasitasnya</p>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : error ? (
        <ErrorState onRetry={fetchClassrooms} />
      ) : classrooms.length === 0 ? (
        <EmptyState title="Belum Ada Ruang Kelas" description="Silakan tambahkan ruang kelas baru." />
      ) : (
        <DataTable 
          columns={columns} 
          data={classrooms} 
          searchKey="name" 
          searchPlaceholder="Cari nama ruangan..." 
          actionElement={actionButton}
        />
      )}

      {/* Form Modal */}
      <Dialog open={modal.open} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal.mode === 'create' ? 'Tambah Ruang Kelas' : 'Edit Ruang Kelas'}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk menyimpan data ruang kelas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Ruangan</Label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Studio A" />
            </div>
            <div className="space-y-2">
              <Label>Kapasitas (Orang)</Label>
              <Input required type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} placeholder="Cth: 20" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={deleteConfirm.open} 
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null })}
        title="Hapus Ruangan"
        description="Apakah Anda yakin ingin menghapus ruangan ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        confirmText="Hapus Ruangan"
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}
