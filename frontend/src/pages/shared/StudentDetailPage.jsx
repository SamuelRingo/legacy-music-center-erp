import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useCachedQuery } from '../../lib/cache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Award, Calendar, Trash2, GraduationCap } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorState from '../../components/shared/ErrorState';
import DataTable from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { toast } from 'sonner';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const fetchStudent = useCallback(async () => {
    const res = await api.get(`/staff/students/${id}`);
    return res.data;
  }, [id]);

  const { data: student, loading, error, refetch } = useCachedQuery(`student_detail_${id}`, fetchStudent);

  const [addAchievementModal, setAddAchievementModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState({ title: '', description: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  if (loading) return <LoadingSkeleton type="card" rows={3} />;
  if (error || !student) return <ErrorState onRetry={refetch} />;

  const profile = student.studentProfile || {};
  const enrollments = profile.enrollments || [];
  const achievements = profile.achievements || [];

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/staff/students/${id}/achievements`, achievementForm);
      toast.success('Prestasi berhasil ditambahkan');
      setAddAchievementModal(false);
      setAchievementForm({ title: '', description: '', date: '' });
      refetch();
    } catch (err) {
      toast.error('Gagal menambahkan prestasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAchievement = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/staff/achievements/${deleteConfirm.id}`);
      toast.success('Prestasi berhasil dihapus');
      setDeleteConfirm({ open: false, id: null });
      refetch();
    } catch (err) {
      toast.error('Gagal menghapus prestasi');
    } finally {
      setIsDeleting(false);
    }
  };

  const getMonthName = (val) => {
    if (val === 1) return 'Repertoir';
    if (val === 2) return 'Ujian';
    if (val === 3) return 'Performance';
    return '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{student.name}</h1>
          <p className="text-sm text-zinc-500">Detail Siswa & Histori Akademik</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Info Umum</TabsTrigger>
          <TabsTrigger value="academic">Kelas & Nilai</TabsTrigger>
          <TabsTrigger value="achievements">Prestasi</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Siswa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Email</p>
                  <p className="text-base text-zinc-900 dark:text-white">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">No. HP Wali</p>
                  <p className="text-base text-zinc-900 dark:text-white">{profile.parentPhone || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-zinc-500">Alamat</p>
                  <p className="text-base text-zinc-900 dark:text-white">{profile.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Status</p>
                  <span className={`inline-block px-2 py-1 mt-1 rounded text-xs font-bold ${
                    student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle>Kelas Aktif & Riwayat</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-6 text-zinc-500">Belum mengikuti kelas apapun.</div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((en) => (
                    <div key={en.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-lg">
                            {en.schedule?.course?.name}
                          </h4>
                          <p className="text-sm text-zinc-500">Guru: {en.schedule?.teacher?.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-500 text-sm font-medium">
                            <GraduationCap className="w-4 h-4" />
                            {en.gradeLevel ? `Grade ${en.gradeLevel}` : 'No Grade'} - {en.currentMonth ? getMonthName(en.currentMonth) : '-'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {en.finalGrades && en.finalGrades.length > 0 ? (
                          <div>
                            <p className="text-sm text-zinc-500 mb-1">
                              Nilai Akhir (Dinilai pada {new Date(en.finalGrades[0].gradedAt).toLocaleDateString('id-ID')})
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {en.finalGrades[0].score}
                              </span>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                                "{en.finalGrades[0].evaluation || 'Tidak ada evaluasi'}"
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-zinc-400">Belum ada nilai akhir.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50 mb-4">
              <CardTitle>Riwayat Prestasi</CardTitle>
              <Button onClick={() => setAddAchievementModal(true)} size="sm" className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
                <Plus className="w-4 h-4 mr-2" /> Tambah Prestasi
              </Button>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Award className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                  <p>Belum ada catatan prestasi.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-900 dark:text-white">{ach.title}</h4>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ach.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{ach.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setDeleteConfirm({ open: true, id: ach.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Achievement Modal */}
      <Dialog open={addAchievementModal} onOpenChange={setAddAchievementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Prestasi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAchievement} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Prestasi / Penghargaan</Label>
              <Input 
                required 
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                placeholder="Juara 1 Lomba Piano Nasional"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input 
                type="date" 
                required 
                value={achievementForm.date}
                onChange={(e) => setAchievementForm({...achievementForm, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi (Opsional)</Label>
              <Textarea 
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                placeholder="Penjelasan singkat mengenai prestasi ini"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddAchievementModal(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-gold-500 hover:bg-gold-600 text-zinc-900">
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Hapus Prestasi"
        description="Apakah Anda yakin ingin menghapus prestasi ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDeleteAchievement}
        loading={isDeleting}
      />
    </div>
  );
}
