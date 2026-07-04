import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import DataTable from '../../components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, KeyRound, Shield, Upload, Edit2, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { ActionMenu } from '../../components/shared/ActionMenu';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import { useDashboardCache } from '../../context/DashboardContext';
import { useCachedQuery, clearCache } from '../../lib/cache';

export default function UsersPage() {
  const { clearDashboardCache } = useDashboardCache();
  const fetchUsersFn = useCallback(async () => {
    const res = await api.get('/admin/users');
    return res.data;
  }, []);
  const { data: usersData, loading, error, refetch: fetchUsers } = useCachedQuery('admin_users', fetchUsersFn);
  const users = usersData || [];
  const [currentUser, setCurrentUser] = useState(null); // the logged in user
  const [activeTab, setActiveTab] = useState('siswa');
  
  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', status: 'ACTIVE', parentPhone: '', address: '', specialization: '' });
  const [isCreating, setIsCreating] = useState(false);

  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ name: '', email: '', status: '', parentPhone: '', address: '', specialization: '' });
  const [isEditing, setIsEditing] = useState(false);

  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [newRole, setNewRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [passwordModal, setPasswordModal] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [csvModal, setCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (createForm.role === 'STUDENT' && (!createForm.parentPhone || !createForm.address)) {
      return toast.error('No HP Orang Tua dan Alamat wajib diisi untuk Siswa.');
    }
    if (createForm.role === 'TEACHER' && !createForm.specialization) {
      return toast.error('Spesialisasi wajib diisi untuk Guru.');
    }

    setIsCreating(true);
    try {
      await api.post('/admin/users', createForm);
      clearDashboardCache('admin');
      clearDashboardCache('staff');
      clearCache('admin_users');
      toast.success('Pengguna baru berhasil dibuat');
      setCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'STUDENT', status: 'ACTIVE', parentPhone: '', address: '', specialization: '' });
      fetchUsers();
    } catch (err) {
      toast.error('Gagal membuat pengguna');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (user) => {
    setEditModal({ open: true, user });
    setEditForm({
      name: user.name,
      email: user.email,
      status: user.status,
      parentPhone: user.studentProfile?.parentPhone || '',
      address: user.studentProfile?.address || '',
      specialization: user.teacherProfile?.specialization || ''
    });
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await api.put(`/admin/users/${editModal.user.id}`, editForm);
      clearCache('admin_users');
      toast.success('Data pengguna diperbarui');
      setEditModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error('Gagal memperbarui data pengguna');
    } finally {
      setIsEditing(false);
    }
  };


  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteModal.user.id}`);
      clearDashboardCache('admin');
      clearDashboardCache('staff');
      clearCache('admin_users');
      toast.success('User berhasil dihapus');
      fetchUsers();
      setDeleteModal({ open: false, user: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeRole = async () => {
    setIsUpdatingRole(true);
    try {
      await api.put(`/admin/users/${roleModal.user.id}/role`, { role: newRole });
      clearDashboardCache('admin');
      clearCache('admin_users');
      toast.success('Role pengguna berhasil diubah');
      setRoleModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    try {
      await api.post(`/admin/users/${passwordModal.user.id}/reset-password`, { newPassword });
      toast.success('Password pengguna berhasil direset');
      setPasswordModal({ open: false, user: null });
      setNewPassword('');
    } catch (err) {
      toast.error('Gagal mereset password');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return toast.error('Pilih file CSV terlebih dahulu');

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      try {
        const res = await api.post('/admin/import-csv', { csvData });
        toast.success(res.data.message);
        setCsvModal(false);
        setCsvFile(null);
        fetchUsers();
      } catch (err) {
        toast.error('Gagal mengimpor CSV');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      INACTIVE: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || colors.INACTIVE}`}>{status}</span>;
  };

  const RoleBadge = ({ role }) => {
    const roleColors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700',
      STAFF: 'bg-blue-100 text-blue-700',
      TEACHER: 'bg-amber-100 text-amber-700',
      STUDENT: 'bg-emerald-100 text-emerald-700'
    };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${roleColors[role] || roleColors.STUDENT}`}>{role}</span>;
  };

  const getActionCell = (row, showRole = true) => {
    // Guards for Role button
    const canChangeRole = 
      showRole && 
      row.id !== currentUser?.id && // Cannot change own role
      row.role !== 'STUDENT'; // Student cannot change role

    return (
      <ActionMenu 
        actions={[
          { label: 'Edit', icon: Edit2, onClick: () => openEditModal(row) },
          canChangeRole && { label: 'Ubah Role', icon: Shield, onClick: () => { setRoleModal({ open: true, user: row }); setNewRole(row.role); } },
          { label: 'Reset Password', icon: KeyRound, onClick: () => setPasswordModal({ open: true, user: row }) },
          { label: 'Hapus', icon: Trash2, onClick: () => setDeleteModal({ open: true, user: row }), isDanger: true }
        ]}
      />
    );
  };

  const siswaColumns = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Status', accessorKey: 'status', cell: row => <StatusBadge status={row.status} /> },
    { header: 'Kelas Terdaftar', cell: row => row.studentProfile?._count?.enrollments || 0 },
    { header: 'No. HP Ortu', cell: row => row.studentProfile?.parentPhone || '-' },
    { header: 'Aksi', className: 'text-right', cell: row => getActionCell(row, false) } // false = hide role button
  ];

  const guruColumns = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Spesialisasi', cell: row => row.teacherProfile?.specialization || '-' },
    { header: 'Status', accessorKey: 'status', cell: row => <StatusBadge status={row.status} /> },
    { header: 'Jml Kelas', cell: row => row._count?.schedules || 0 },
    { header: 'Aksi', className: 'text-right', cell: row => getActionCell(row, true) }
  ];

  const staffColumns = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role', cell: row => <RoleBadge role={row.role} /> },
    { header: 'Status', accessorKey: 'status', cell: row => <StatusBadge status={row.status} /> },
    { header: 'Aksi', className: 'text-right', cell: row => getActionCell(row, true) }
  ];

  const siswaData = useMemo(() => users.filter(u => u.role === 'STUDENT'), [users]);
  const guruData = useMemo(() => users.filter(u => u.role === 'TEACHER'), [users]);
  const staffData = useMemo(() => users.filter(u => u.role === 'STAFF' || u.role === 'SUPER_ADMIN'), [users]);

  const openCreateModal = (defaultRole) => {
    setCreateForm({ name: '', email: '', password: '', role: defaultRole, status: 'ACTIVE', parentPhone: '', address: '', specialization: '' });
    setCreateModal(true);
  };

  const siswaActionButtons = (
    <>
      <Button variant="outline" onClick={() => setCsvModal(true)} className="gap-2">
        <Upload size={16} /> Import CSV
      </Button>
      <Button onClick={() => openCreateModal('STUDENT')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
        <Plus size={16} /> Tambah Siswa
      </Button>
    </>
  );

  const guruActionButtons = (
    <Button onClick={() => openCreateModal('TEACHER')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
      <Plus size={16} /> Tambah Guru
    </Button>
  );

  const staffActionButtons = (
    <Button onClick={() => openCreateModal('STAFF')} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
      <Plus size={16} /> Tambah Staff/Admin
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Manajemen Pengguna</h1>
        <p className="text-sm text-zinc-500">Kelola semua akun dengan batasan role dan keamanan tinggi</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'siswa', label: `Siswa (${siswaData.length})` },
          { id: 'guru', label: `Guru (${guruData.length})` },
          { id: 'staff', label: `Staff & Admin (${staffData.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-amber-600 text-amber-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : error ? (
        <ErrorState onRetry={fetchUsers} />
      ) : (
        <>
          {activeTab === 'siswa' && (
            siswaData.length === 0 ? <EmptyState title="Belum Ada Siswa" description="Tambahkan siswa baru untuk mulai mengelola." /> :
            <DataTable columns={siswaColumns} data={siswaData} searchKey="name" searchPlaceholder="Cari siswa..." actionElement={siswaActionButtons} />
          )}
          {activeTab === 'guru' && (
            guruData.length === 0 ? <EmptyState title="Belum Ada Guru" description="Tambahkan guru baru." /> :
            <DataTable columns={guruColumns} data={guruData} searchKey="name" searchPlaceholder="Cari guru..." actionElement={guruActionButtons} />
          )}
          {activeTab === 'staff' && (
            staffData.length === 0 ? <EmptyState title="Belum Ada Staff" description="Tambahkan staff baru." /> :
            <DataTable columns={staffColumns} data={staffData} searchKey="name" searchPlaceholder="Cari staff/admin..." actionElement={staffActionButtons} />
          )}
        </>
      )}

      {/* Edit User Modal */}
      <Dialog open={editModal.open} onOpenChange={open => !open && setEditModal({ open: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data {editModal.user?.role}</DialogTitle>
            <DialogDescription>Sesuaikan informasi pengguna.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Specific Fields */}
            {editModal.user?.role === 'STUDENT' && (
              <>
                <div className="space-y-2">
                  <Label>No. HP Orang Tua</Label>
                  <Input value={editForm.parentPhone} onChange={e => setEditForm({ ...editForm, parentPhone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
              </>
            )}
            
            {editModal.user?.role === 'TEACHER' && (
              <div className="space-y-2">
                <Label>Spesialisasi</Label>
                <Input value={editForm.specialization} onChange={e => setEditForm({ ...editForm, specialization: e.target.value })} placeholder="Cth: Piano Klasik" />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditModal({ open: false, user: null })}>Batal</Button>
              <Button type="submit" disabled={isEditing}>{isEditing ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Confirmation Dialog */}
      <ConfirmDialog
        open={roleModal.open}
        onOpenChange={open => !open && setRoleModal({ open: false, user: null })}
        title="Ubah Role Pengguna"
        description={
          <div className="space-y-4">
            <p>Pilih role baru untuk <b>{roleModal.user?.name}</b>. Perhatikan batasan akses:</p>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger><SelectValue placeholder="Pilih Role" /></SelectTrigger>
              <SelectContent>
                {/* Available options based on current role */}
                {roleModal.user?.role === 'TEACHER' && (
                  <SelectItem value="STAFF">Jadikan Staff</SelectItem>
                )}
                {roleModal.user?.role === 'STAFF' && (
                  <SelectItem value="TEACHER">Jadikan Guru</SelectItem>
                )}
                {roleModal.user?.role === 'SUPER_ADMIN' && (
                  <>
                    <SelectItem value="STAFF">Turunkan ke Staff</SelectItem>
                    <SelectItem value="TEACHER">Turunkan ke Guru</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-rose-600 font-medium">Tindakan ini permanen dan mengubah hak akses sistem sepenuhnya.</p>
          </div>
        }
        onConfirm={handleChangeRole}
        confirmText="Ubah Role"
        variant="warning"
        disabled={!newRole || newRole === roleModal.user?.role || isUpdatingRole}
      />

      {/* ... (Create and CSV Modals remain the same) ... */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'siswa' ? 'Tambah Siswa Baru' : activeTab === 'guru' ? 'Tambah Guru Baru' : 'Tambah Staff/Admin Baru'}
            </DialogTitle>
            <DialogDescription>Buat akun baru dan lengkapi datanya.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" required value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} />
            </div>
            
            {activeTab === 'staff' && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={createForm.role} onValueChange={v => setCreateForm({ ...createForm, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeTab === 'siswa' && (
              <>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={createForm.status} onValueChange={v => setCreateForm({ ...createForm, status: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>No. HP Orang Tua</Label>
                  <Input value={createForm.parentPhone} onChange={e => setCreateForm({ ...createForm, parentPhone: e.target.value })} placeholder="Cth: 08123456789" />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Textarea value={createForm.address} onChange={e => setCreateForm({ ...createForm, address: e.target.value })} placeholder="Cth: Jl. Sudirman No 1" />
                </div>
              </>
            )}

            {activeTab === 'guru' && (
              <div className="space-y-2">
                <Label>Spesialisasi</Label>
                <Input value={createForm.specialization} onChange={e => setCreateForm({ ...createForm, specialization: e.target.value })} placeholder="Cth: Piano Klasik" />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)}>Batal</Button>
              <Button type="submit" disabled={isCreating}>{isCreating ? 'Menyimpan...' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={passwordModal.open}
        onOpenChange={open => {
          if (!open) {
            setPasswordModal({ open: false, user: null });
            setNewPassword('');
          }
        }}
        title="Reset Password"
        description={`Masukkan password baru untuk ${passwordModal.user?.name}.`}
        variant="warning"
        onConfirm={() => document.getElementById('btn-submit-reset').click()}
        isProcessing={isResetting}
        confirmText="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label>Password Baru</Label>
            <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          {/* Hidden submit button triggered by dialog action */}
          <button type="submit" id="btn-submit-reset" className="hidden">Submit</button>
        </form>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={open => !open && setDeleteModal({ open: false, user: null })}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus user ${deleteModal.user?.name}? Semua data yang terkait dengan user ini akan ikut terhapus. Tindakan ini permanen.`}
        variant="danger"
        confirmText="Hapus User"
        onConfirm={handleDeleteUser}
        isProcessing={isDeleting}
      />

      <Dialog open={csvModal} onOpenChange={setCsvModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data Siswa (CSV)</DialogTitle>
            <DialogDescription>Upload file CSV yang berisi data siswa baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCsvImport} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>File CSV</Label>
              <Input type="file" accept=".csv" required onChange={e => setCsvFile(e.target.files[0])} />
              <p className="text-xs text-zinc-500 mt-1">Pastikan format sesuai dengan CSV_TEMPLATE_SISWA.csv (name, email, password, parentPhone, address).</p>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => { setCsvModal(false); setCsvFile(null); }}>Batal</Button>
              <Button type="submit" disabled={isImporting}>{isImporting ? 'Mengimpor...' : 'Import Data'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
