import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, UploadCloud, Trash, Image as ImageIcon, MessageSquare, LayoutTemplate, MapPin, Share2 } from 'lucide-react';
import api from '@/lib/api';
import imageCompression from 'browser-image-compression';

import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

export default function LandingCmsPage() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, section: '', key: '' });
  const fileRefs = useRef({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/staff/landing-content?section=all');
      const contentMap = {};
      res.data.forEach(item => {
        if (!contentMap[item.section]) contentMap[item.section] = {};
        contentMap[item.section][item.key] = item.value;
      });
      setData(contentMap);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data CMS. Periksa koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
  });

  const handleSave = async (section, key, value, file = null) => {
    const saveKey = `${section}_${key}`;
    setSaving(prev => ({ ...prev, [saveKey]: true }));
    
    try {
      let imageBase64 = null;
      if (file) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        imageBase64 = await toBase64(compressedFile);
      }

      const res = await api.put('/staff/landing-content', {
        section,
        key,
        value,
        imageBase64
      });

      setData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [key]: res.data.value
        }
      }));

      // Only toast individual saves for images, so we don't spam toasts on batch save
      if (file || value === '') {
         toast.success(value === '' ? `Gambar dihapus` : `Gambar berhasil diunggah`);
      }
      
      if (deleteConfirm.isOpen) {
        setDeleteConfirm({ isOpen: false, section: '', key: '' });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Gagal menyimpan ${key}`);
    } finally {
      setSaving(prev => ({ ...prev, [saveKey]: false }));
    }
  };

  const handleSaveSection = async (section) => {
    setSaving(prev => ({ ...prev, [`${section}_all`]: true }));
    
    try {
      const sectionData = data[section] || {};
      
      const textKeys = {
        about: ['title', 'description', 'stat_courses', 'stat_grades', 'stat_teachers'],
        facility: [
          'f1_title', 'f1_desc', 'f2_title', 'f2_desc', 'f3_title', 'f3_desc',
          'f4_title', 'f4_desc', 'f5_title', 'f5_desc', 'f6_title', 'f6_desc'
        ],
        footer: ['email', 'phone', 'hours', 'address', 'maps_url', 'instagram', 'youtube', 'whatsapp'],
        chatbot: ['system_prompt']
      };

      const keysToSave = textKeys[section];
      if (!keysToSave) return;

      const promises = keysToSave.map(key => {
        const value = sectionData[key] || '';
        return api.put('/staff/landing-content', { section, key, value });
      });

      await Promise.all(promises);
      toast.success(`Semua perubahan di tab ${section.toUpperCase()} berhasil disimpan`);
    } catch (err) {
      console.error(err);
      toast.error(`Beberapa perubahan gagal disimpan.`);
    } finally {
      setSaving(prev => ({ ...prev, [`${section}_all`]: false }));
    }
  };

  const handleChange = (section, key, val) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: val
      }
    }));
  };

  const handleDeleteImage = () => {
    const { section, key } = deleteConfirm;
    handleSave(section, key, '');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Konten Landing Page</h1>
          <p className="text-zinc-500">Atur konten halaman depan sekolah musik secara real-time.</p>
        </div>
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <ErrorState message={error} onRetry={fetchContent} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Konten Landing Page</h1>
        <p className="text-zinc-500">Atur konten halaman depan sekolah musik secara real-time.</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-zinc-100/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="hero" className="rounded-lg"><ImageIcon className="w-4 h-4 mr-2"/> Hero</TabsTrigger>
          <TabsTrigger value="about" className="rounded-lg"><LayoutTemplate className="w-4 h-4 mr-2"/> About</TabsTrigger>
          <TabsTrigger value="facility" className="rounded-lg"><Share2 className="w-4 h-4 mr-2"/> Facility</TabsTrigger>
          <TabsTrigger value="footer" className="rounded-lg"><MapPin className="w-4 h-4 mr-2"/> Footer</TabsTrigger>
          <TabsTrigger value="chatbot" className="rounded-lg"><MessageSquare className="w-4 h-4 mr-2"/> ChatBot</TabsTrigger>
        </TabsList>

        {/* HERO TAB */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Hero Slider Images</CardTitle>
              <CardDescription>Upload maksimal 10 gambar untuk slider di background hero (rasio bebas, landscape direkomendasikan).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="mb-6">
                 <label className="block w-full sm:w-1/2 md:w-1/3">
                   <Button type="button" variant="default" className="w-full flex items-center justify-center gap-2" onClick={() => fileRefs.current['hero-upload-new']?.click()}>
                     <UploadCloud size={16} /> 
                     <span>Upload New Image</span>
                   </Button>
                   <input ref={el => fileRefs.current['hero-upload-new'] = el} type="file" className="hidden" accept="image/*" onChange={(e) => {
                     if (e.target.files[0]) {
                       for (let i = 1; i <= 10; i++) {
                         const key = `slider_${i}`;
                         if (!data.hero?.[key]) {
                           handleSave('hero', key, '', e.target.files[0]);
                           break;
                         }
                       }
                     }
                   }} />
                 </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                  const key = `slider_${num}`;
                  const imgUrl = data.hero?.[key];
                  const isSaving = saving[`hero_${key}`];

                  return (
                    <Card key={num} className="p-2 border border-zinc-200 shadow-sm rounded-xl bg-white flex flex-col justify-between">
                      <div className="w-full h-24 rounded-lg overflow-hidden relative bg-zinc-50 border border-zinc-200 mb-2">
                        {imgUrl ? (
                           <>
                             <img src={imgUrl} alt={`Slider ${num}`} className="w-full h-full object-cover" />
                             {isSaving && (
                               <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                 <span className="text-xs font-medium text-zinc-700 animate-pulse">Menyimpan...</span>
                               </div>
                             )}
                           </>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-300">
                             <ImageIcon size={24} />
                           </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center mt-auto">
                         {imgUrl ? (
                           <Button 
                             variant="destructive" 
                             size="sm" 
                             className="w-full sm:w-auto gap-2"
                             onClick={() => setDeleteConfirm({ isOpen: true, section: 'hero', key })}
                             disabled={isSaving}
                           >
                             <Trash size={14} /> Hapus
                           </Button>
                         ) : (
                           <label className="w-full block">
                             <Button type="button" variant="outline" size="sm" className="w-full flex items-center justify-center gap-2" disabled={isSaving} onClick={() => fileRefs.current[`hero-slot-${num}`]?.click()}>
                               {isSaving ? <span>Uploading...</span> : <><UploadCloud size={14} /> <span>Slot {num}</span></>}
                             </Button>
                             <input ref={el => fileRefs.current[`hero-slot-${num}`] = el} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                if(e.target.files[0]) handleSave('hero', key, '', e.target.files[0]);
                             }} disabled={isSaving} />
                           </label>
                         )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about" className="space-y-6">
          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">About Section Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="aboutTitle" className="mb-2 block">Judul About</Label>
                    <Input 
                      id="aboutTitle"
                      value={data.about?.title || ''} 
                      onChange={(e) => handleChange('about', 'title', e.target.value)} 
                      className="w-full"
                      placeholder="Tempat Di Mana Musik Hidup"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="aboutDesc" className="mb-2 block">Deskripsi Paragraf</Label>
                    <Textarea 
                      id="aboutDesc"
                      value={data.about?.description || ''} 
                      onChange={(e) => handleChange('about', 'description', e.target.value)} 
                      rows={6} 
                      className="w-full"
                      placeholder="Legacy Music Center membuka dunia musik melalui bimbingan dari guru yang berpengalaman..."
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Jenis Kursus</Label>
                    <Input value={data.about?.stat_courses || ''} onChange={(e) => handleChange('about', 'stat_courses', e.target.value)} className="w-full" placeholder="9+" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Grade Level</Label>
                    <Input value={data.about?.stat_grades || ''} onChange={(e) => handleChange('about', 'stat_grades', e.target.value)} className="w-full" placeholder="5" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Total Instruktur</Label>
                    <Input value={data.about?.stat_teachers || ''} onChange={(e) => handleChange('about', 'stat_teachers', e.target.value)} className="w-full" placeholder="10+" />
                  </div>
                </div>
                
              </div>
              
              {/* Separate Row for Image Uploads */}
              <div className="mt-8 border-t border-zinc-200 pt-6">
                <Label className="text-base font-semibold mb-4 block">Gambar Carousel</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3].map(num => {
                    const key = `image_${num}`;
                    const isSaving = saving[`about_${key}`];
                    return (
                      <Card key={num} className="p-4 border border-zinc-200 shadow-sm rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-16 relative rounded-md overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                            {data.about?.[key] ? (
                              <img src={data.about[key]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={16}/></div>
                            )}
                            {isSaving && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><LoadingSkeleton className="w-full h-full" /></div>}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-sm">Slot {num}</Label>
                            <label>
                              <Button type="button" variant="outline" size="sm" disabled={isSaving} className="w-full sm:w-auto flex items-center justify-center gap-2" onClick={() => fileRefs.current[`about-img-${num}`]?.click()}>
                                <UploadCloud size={14} /> 
                                <span>Ganti Gambar</span>
                              </Button>
                              <input ref={el => fileRefs.current[`about-img-${num}`] = el} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                if(e.target.files[0]) handleSave('about', key, '', e.target.files[0]);
                              }} disabled={isSaving} />
                            </label>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              <div className="border-t border-zinc-200 pt-6 mt-8 flex justify-end">
                <Button onClick={() => handleSaveSection('about')} disabled={saving['about_all']} className="w-full sm:w-auto gap-2">
                  <Save size={16} /> {saving['about_all'] ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACILITY TAB */}
        <TabsContent value="facility" className="space-y-6">
          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">Facility Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const imgKey = `f${num}_img`;
                  const titleKey = `f${num}_title`;
                  const descKey = `f${num}_desc`;
                  
                  return (
                    <Card key={num} className="p-4 bg-white border border-zinc-200 shadow-sm rounded-xl h-full flex flex-col">
                      <div className="h-40 w-full bg-zinc-100 rounded-lg relative overflow-hidden group border border-zinc-200 shrink-0 mb-4">
                        {data.facility?.[imgKey] ? (
                          <img src={data.facility[imgKey]} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={24}/></div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <label>
                            <Button type="button" variant="secondary" size="sm" disabled={saving[`facility_${imgKey}`]} className="w-full sm:w-auto flex items-center justify-center gap-2" onClick={() => fileRefs.current[`facility-img-${num}`]?.click()}>
                              <UploadCloud size={14} /> 
                              <span>Upload Foto</span>
                            </Button>
                            <input ref={el => fileRefs.current[`facility-img-${num}`] = el} type="file" className="hidden" accept="image/*" onChange={(e) => {
                              if(e.target.files[0]) handleSave('facility', imgKey, '', e.target.files[0]);
                            }} disabled={saving[`facility_${imgKey}`]} />
                          </label>
                        </div>
                        {saving[`facility_${imgKey}`] && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><LoadingSkeleton className="w-full h-full" /></div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col space-y-4">
                        <div>
                          <Label className="mb-2 block text-xs font-semibold uppercase text-zinc-500">Judul Fasilitas</Label>
                          <Input value={data.facility?.[titleKey] || ''} onChange={(e) => handleChange('facility', titleKey, e.target.value)} className="w-full" placeholder="Belum ada konten" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <Label className="mb-2 block text-xs font-semibold uppercase text-zinc-500">Deskripsi</Label>
                          <Textarea value={data.facility?.[descKey] || ''} onChange={(e) => handleChange('facility', descKey, e.target.value)} className="text-sm flex-1 w-full" rows={3} placeholder="Belum ada konten" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="border-t border-zinc-200 pt-6 mt-8 flex justify-end">
                <Button onClick={() => handleSaveSection('facility')} disabled={saving['facility_all']} className="w-full sm:w-auto gap-2">
                  <Save size={16} /> {saving['facility_all'] ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER TAB */}
        <TabsContent value="footer" className="space-y-6">
          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
            <CardHeader><CardTitle className="text-lg font-semibold mb-4">Informasi Kontak & Lokasi</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Email</Label>
                    <Input value={data.footer?.email || ''} onChange={(e) => handleChange('footer', 'email', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Telepon</Label>
                    <Input value={data.footer?.phone || ''} onChange={(e) => handleChange('footer', 'phone', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Jam Operasional (Gunakan &lt;br/&gt; untuk baris baru)</Label>
                    <Input value={data.footer?.hours || ''} onChange={(e) => handleChange('footer', 'hours', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Alamat Lengkap</Label>
                    <Textarea value={data.footer?.address || ''} onChange={(e) => handleChange('footer', 'address', e.target.value)} className="w-full" rows={4} placeholder="Belum ada konten" />
                  </div>
                  <div>
                    <Label className="mb-2 block">URL Google Maps (Iframe Src)</Label>
                    <Input value={data.footer?.maps_url || ''} onChange={(e) => handleChange('footer', 'maps_url', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                  </div>
                </div>
              </div>
              
              {/* Social Media Row */}
              <div className="mt-8 border-t border-zinc-200 pt-6">
                 <Label className="text-lg font-semibold mb-6 block">Social Media Links</Label>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <Label className="mb-2 block">Instagram URL</Label>
                      <Input value={data.footer?.instagram || ''} onChange={(e) => handleChange('footer', 'instagram', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                    </div>
                    <div>
                      <Label className="mb-2 block">YouTube URL</Label>
                      <Input value={data.footer?.youtube || ''} onChange={(e) => handleChange('footer', 'youtube', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                    </div>
                    <div>
                      <Label className="mb-2 block">WhatsApp URL</Label>
                      <Input value={data.footer?.whatsapp || ''} onChange={(e) => handleChange('footer', 'whatsapp', e.target.value)} className="w-full" placeholder="Belum ada konten" />
                    </div>
                 </div>
              </div>

              <div className="border-t border-zinc-200 pt-6 mt-8 flex justify-end">
                <Button onClick={() => handleSaveSection('footer')} disabled={saving['footer_all']} className="w-full sm:w-auto gap-2">
                  <Save size={16} /> {saving['footer_all'] ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHATBOT TAB */}
        <TabsContent value="chatbot" className="space-y-6">
          <Card className="bg-white border-zinc-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold mb-4">ChatBot System Prompt</CardTitle>
              <CardDescription>Instruksikan bagaimana bot AI (Gemini) harus menjawab pertanyaan pengunjung.</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Textarea 
                  value={data.chatbot?.system_prompt || ''} 
                  onChange={(e) => handleChange('chatbot', 'system_prompt', e.target.value)} 
                  className="font-mono text-sm leading-relaxed bg-zinc-50 border-zinc-200 min-h-[300px] w-full" 
                  placeholder="Belum ada konten"
                />
              </div>
              
              <div className="border-t border-zinc-200 pt-6 mt-6 flex justify-end">
                <Button onClick={() => handleSaveSection('chatbot')} disabled={saving['chatbot_all']} className="w-full sm:w-auto gap-2">
                  <Save size={16} /> {saving['chatbot_all'] ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirm.isOpen}
        onOpenChange={(isOpen) => setDeleteConfirm(prev => ({ ...prev, isOpen }))}
        title="Hapus Gambar"
        description="Apakah Anda yakin ingin menghapus gambar ini dari halaman depan? Aksi ini tidak bisa dibatalkan."
        variant="danger"
        onConfirm={handleDeleteImage}
        isProcessing={saving[`${deleteConfirm.section}_${deleteConfirm.key}`]}
      />
    </div>
  );
}
