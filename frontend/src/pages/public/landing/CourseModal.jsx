import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, Star, Music, Users, X } from 'lucide-react';

export default function CourseModal({ course, open, onOpenChange }) {
  if (!course) return null;

  const isComingSoon = course.teachers.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-zinc-900 border-none text-zinc-100 !w-[90vw] md:!w-[900px] !max-w-[95vw] md:!max-w-[900px] max-h-[85vh] md:max-h-[500px] p-0 overflow-hidden rounded-2xl outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 ring-offset-0 [&>button]:text-zinc-400 [&>button:hover]:text-white [&>button]:focus:outline-none [&>button]:focus:ring-0 [&>button]:ring-offset-0"
      >
        <DialogTitle className="sr-only">Detail Kursus {course.name}</DialogTitle>
        <DialogDescription className="sr-only">Informasi lengkap mengenai kursus {course.name}</DialogDescription>
        
        <div className="flex flex-row w-full h-full min-h-[300px] md:h-[500px]">
          {/* Kolom Kiri: GAMBAR 60% */}
          <div className="w-[60%] relative h-full shrink-0">
            <img 
              src={`/${course.name.replace(/\s+/g, '')}1.jpg`} 
              alt={course.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/Jumbotron1.webp'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/50" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow-lg">{course.name}</h2>
            </div>
          </div>

          {/* Kolom Kanan: TEKS 40% */}
          <div className="w-[40%] h-full bg-zinc-900 p-4 md:p-6 flex flex-col relative z-10 shrink-0 overflow-y-auto outline-none focus:outline-none focus-visible:outline-none ring-0 border-none">
            
            <div className="flex flex-col gap-2 mb-4 mt-2">
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/80 px-3 py-2 rounded-lg text-[10px] md:text-xs">
                <Clock size={14} className="text-gold-500 shrink-0" />
                <span>3 Bulan per Grade</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/80 px-3 py-2 rounded-lg text-[10px] md:text-xs">
                <Star size={14} className="text-gold-500 shrink-0" />
                <span>Semua Level</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/80 px-3 py-2 rounded-lg text-[10px] md:text-xs">
                <Music size={14} className="text-gold-500 shrink-0" />
                <span>Grade 1 - 5</span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-6">
              {course.description || `Pelajari ${course.name} dengan metode pengajaran terbaik dari instruktur profesional Legacy Music Center.`}
            </p>

            {/* Teachers */}
            <div className="mb-6">
              <h4 className="flex items-center gap-2 text-sm md:text-base font-bold text-white mb-3">
                <Users size={16} className="text-gold-500" />
                Instruktur
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isComingSoon ? (
                  <div className="flex items-center gap-3 bg-zinc-800/30 p-2 rounded-xl border border-zinc-800/50">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                      <Users size={16} />
                    </div>
                    <span className="font-medium text-zinc-400 text-xs">Coming Soon</span>
                  </div>
                ) : (
                  course.teachers.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-800/30 p-2 rounded-xl border border-zinc-800/50">
                      <img 
                        src={`/${t.name.split(' ')[0]}.webp`} 
                        alt={t.name}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="font-medium text-zinc-200 text-xs truncate" title={t.name}>{t.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action */}
            <div className="mt-auto pt-2">
              {isComingSoon ? (
                <Button disabled className="w-full bg-zinc-800 text-zinc-500 h-10 text-xs md:text-sm rounded-xl">
                  Segera Hadir
                </Button>
              ) : (
                <Link to="/register" className="block w-full" onClick={() => onOpenChange(false)}>
                  <Button className="w-full bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold h-10 text-xs md:text-sm rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 transition-transform active:scale-[0.98]">
                    Daftar Kursus Ini
                  </Button>
                </Link>
              )}
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
