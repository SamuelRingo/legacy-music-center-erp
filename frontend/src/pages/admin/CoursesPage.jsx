import { useState, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Users } from 'lucide-react';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useCachedQuery, clearCache } from '../../lib/cache';

export default function CoursesPage() {
  const fetchCoursesFn = useCallback(async () => {
    const res = await api.get('/admin/courses');
    return res.data;
  }, []);
  const { data: coursesData, loading, error, refetch: fetchCourses } = useCachedQuery('admin_courses', fetchCoursesFn);
  const courses = coursesData || [];
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [studentModal, setStudentModal] = useState({ open: false, course: null });
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const openStudentModal = async (course) => {
    setStudentModal({ open: true, course });
    setLoadingStudents(true);
    try {
      const res = await api.get(`/admin/courses/${course.id}/students`);
      setStudentsList(res.data || []);
    } catch (err) {
      toast.error('Gagal memuat data murid');
    } finally {
      setLoadingStudents(false);
    }
  };

  const openModal = (mode, data = null) => {
    setModal({ open: true, mode, data });
    setFormData(data ? { name: data.name, description: data.description || '' } : { name: '', description: '' });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', data: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name: formData.name, description: formData.description };
      if (modal.mode === 'create') {
        await api.post('/admin/courses', payload);
        toast.success('Kursus berhasil ditambahkan');
      } else {
        await api.put(`/admin/courses/${modal.data.id}`, payload);
        toast.success('Kursus berhasil diperbarui');
      }
      clearCache('admin_courses');
      closeModal();
      fetchCourses();
    } catch (err) {
      toast.error('Gagal menyimpan kursus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/courses/${deleteConfirm.id}`);
      clearCache('admin_courses');
      toast.success('Kursus dihapus');
      fetchCourses();
    } catch (err) {
      toast.error('Gagal menghapus kursus (Mungkin sedang digunakan)');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const columns = [
    { header: 'Nama Kursus', accessorKey: 'name' },
    { 
      header: 'Deskripsi', 
      accessorKey: 'description', 
      cell: (row) => (
        <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.description || ''}>
          {row.description || '-'}
        </div>
      ) 
    },
    { header: 'Guru', cell: (row) => row.teachers?.length ? row.teachers.join(', ') : '-' },
    { header: 'Jumlah Murid', cell: (row) => row.studentCount || 0 },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <ActionMenu
          actions={[
            { label: 'Lihat Murid', icon: Users, onClick: () => openStudentModal(row) },
            { label: 'Edit', icon: Edit2, onClick: () => openModal('edit', row) },
            { label: 'Hapus', icon: Trash2, onClick: () => setDeleteConfirm({ open: true, id: row.id }), isDanger: true }
          ]}
        />
      )
    }
  ];

  const actionButton = (
    <Button onClick={() => openModal('create')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
      <Plus size={16} /> Tambah Kursus
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Kursus Musik</h1>
        <p className="text-sm text-zinc-500">Kelola daftar kursus atau kelas musik yang tersedia</p>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : error ? (
        <ErrorState onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <EmptyState title="Belum Ada Kursus" description="Silakan tambahkan kursus musik pertama Anda." />
      ) : (
        <DataTable 
          columns={columns} 
          data={courses} 
          searchKey="name" 
          searchPlaceholder="Cari nama kursus..." 
          actionElement={actionButton}
        />
      )}

      {/* Form Modal */}
      <Dialog open={modal.open} onOpenChange={open => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal.mode === 'create' ? 'Tambah Kursus' : 'Edit Kursus'}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah untuk menyimpan data kursus musik.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Kursus</Label>
              <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Cth: Piano Klasik" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Penjelasan singkat mengenai kursus..." />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student List Modal */}
      <Dialog open={studentModal.open} onOpenChange={open => !open && setStudentModal({ open: false, course: null })}>
        <DialogContent className="w-[900px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Daftar Murid: {studentModal.course?.name}</DialogTitle>
            <DialogDescription>
              Menampilkan seluruh siswa yang terdaftar di kelas kursus ini.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 max-h-[80vh] overflow-y-auto">
            {loadingStudents ? (
              <LoadingSkeleton type="table" rows={3} columns={4} />
            ) : studentsList.length === 0 ? (
              <EmptyState title="Belum Ada Murid" description="Belum ada murid yang terdaftar di kursus ini." />
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left text-zinc-600 dark:text-zinc-400">
                  <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama Murid</th>
                      <th className="px-4 py-3 font-medium">Kelas</th>
                      <th className="px-4 py-3 font-medium">Guru</th>
                      <th className="px-4 py-3 font-medium text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    {studentsList.map(st => (
                      <tr key={st.enrollmentId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">{st.studentName}</td>
                        <td className="px-4 py-3">{st.scheduleName}</td>
                        <td className="px-4 py-3">{st.teacherName}</td>
                        <td className="px-4 py-3 text-center">
                          {st.grade !== '-' ? (
                            <span className="px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">{st.grade}</span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentModal({ open: false, course: null })}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        open={deleteConfirm.open} 
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, id: null })}
        title="Hapus Kursus"
        description="Apakah Anda yakin ingin menghapus kursus ini? Semua jadwal yang menggunakan kursus ini mungkin akan terdampak."
        onConfirm={handleDelete}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </div>
  );
}
