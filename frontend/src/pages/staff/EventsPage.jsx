import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Image as ImageIcon, Edit } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [form, setForm] = useState({ id: null, title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/staff/events');
      setEvents(res.data);
    } catch (err) {
      toast.error('Gagal memuat event');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateClick = () => {
    setForm({ id: null, title: '', description: '' });
    setImageFile(null);
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const handleEditClick = (event) => {
    setForm({ id: event.id, title: event.title, description: event.description || '' });
    setImageFile(null);
    setPreviewUrl(event.imageUrl);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Judul wajib diisi');
    if (!form.id && !imageFile) return toast.error('Gambar banner wajib diisi');

    setIsUploading(true);
    try {
      let imageBase64 = null;
      
      if (imageFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(imageFile, options);
        
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const payload = {
        title: form.title,
        description: form.description
      };
      
      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }

      if (form.id) {
        await api.put(`/staff/events/${form.id}`, payload);
        toast.success('Event banner berhasil diperbarui');
      } else {
        await api.post('/staff/events', payload);
        toast.success('Event banner berhasil ditambahkan');
      }

      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Gagal menyimpan event banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/staff/events/${deleteDialog.id}`);
      toast.success('Event banner dihapus');
      setDeleteDialog({ open: false, id: null });
      fetchEvents();
    } catch (err) {
      toast.error('Gagal menghapus banner');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="card" rows={3} />;
  }

  if (error) {
    return <ErrorState onRetry={fetchEvents} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Event Banner CMS</h1>
          <p className="text-sm text-zinc-500">Kelola banner acara untuk halaman utama (Landing Page)</p>
        </div>
        <Button onClick={handleCreateClick} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <Plus size={16} /> Tambah Banner
        </Button>
      </div>

      {events.length === 0 ? (
        <EmptyState title="Belum Ada Event Banner" description="Tambahkan banner acara untuk ditampilkan di halaman utama." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden group">
              <div className="relative aspect-[21/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <div className="bg-white/90 dark:bg-black/80 rounded-md backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionMenu actions={[
                      { label: 'Edit', icon: Edit, onClick: () => handleEditClick(event) },
                      { label: 'Hapus', icon: Trash2, isDanger: true, onClick: () => setDeleteDialog({ open: true, id: event.id }) }
                    ]} />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white truncate">{event.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mt-1">{event.description || '-'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit Event Banner' : 'Tambah Event Banner'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Judul Event *</Label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Konser Akhir Tahun" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Keterangan singkat event..." />
            </div>
            <div className="space-y-2">
              <Label>Gambar Banner (max 1920px) {form.id ? '(Opsional)' : '*'}</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} required={!form.id} />
              {previewUrl && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-[21/9] border border-zinc-200 dark:border-zinc-800">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isUploading}>{isUploading ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={open => !open && setDeleteDialog({ open: false, id: null })}
        title="Hapus Banner"
        description="Yakin ingin menghapus banner ini? Tindakan ini permanen."
        variant="danger"
        confirmText="Hapus Banner"
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}
