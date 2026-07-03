import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';

export default function ProfilePage({ user: propUser }) {
  const [user, setUser] = useState(propUser || null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!propUser) {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [propUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword) {
      return toast.error('Password lama tidak boleh kosong');
    }
    if (newPassword.length < 6) {
      return toast.error('Password baru minimal 6 karakter');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Konfirmasi password tidak cocok');
    }

    setIsLoading(true);
    try {
      const res = await api.put('/auth/change-password', { oldPassword, newPassword });
      toast.success(res.data.message || 'Password berhasil diubah');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Profil Saya</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Kelola informasi akun dan kata sandi Anda</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Informasi Pribadi</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nama Lengkap</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Alamat Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
              <input
                type="text"
                disabled
                value={user?.role || ''}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Ubah Kata Sandi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password Lama</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="Masukkan password lama"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                placeholder="Ulangi password baru"
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
