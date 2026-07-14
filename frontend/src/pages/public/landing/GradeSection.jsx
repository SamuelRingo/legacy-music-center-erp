import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Medal, Star, Trophy } from 'lucide-react';

export default function GradeSection() {
  const grades = [
    { level: 1, title: 'Fase Pengenalan', desc: 'Temukan minatmu. Di fase ini, siswa mencoba berbagai alat musik untuk menemukan yang paling cocok dengan bakat dan passion mereka.', icon: BookOpen },
    { level: 2, title: 'Fase Pemahaman', desc: 'Mulai mendalami. Siswa fokus pada satu instrumen pilihan, mempelajari teknik dasar, teori musik, dan membangun fondasi yang kuat.', icon: Star },
    { level: 3, title: 'Fase Pengembangan', desc: 'Kembangkan skill-mu. Teknik lanjutan, eksplorasi genre, dan pengembangan gaya personal mulai diasah di fase ini.', icon: Medal },
    { level: 4, title: 'Fase Kolaborasi', desc: 'Saatnya bermain bersama! Siswa bergabung dalam band, grup ansambel, atau kolaborasi lintas instrumen untuk membangun kemampuan teamwork musikal.', icon: Trophy },
    { level: 5, title: 'Fase Improvisasi', desc: 'Puncak kreativitas. Siswa menciptakan, mengimprovisasi, dan mengekspresikan musik mereka sendiri secara mandiri.', icon: GraduationCap }
  ];

  const months = [
    { num: 1, title: 'Bulan 1: Repertoir', desc: 'Mempelajari dan menyiapkan repertoar lagu.' },
    { num: 2, title: 'Bulan 2: Ujian', desc: 'Ujian teori dan praktek untuk menguji pemahaman.' },
    { num: 3, title: 'Bulan 3: Student Performance', desc: 'Penampilan langsung siswa di depan audiens.' }
  ];

  return (
    <section id="grades" className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white uppercase tracking-tight">
            Sistem <span className="text-gold-500">Grade</span> Pembelajaran
          </h2>
          <p className="text-zinc-400 text-lg">
            Kurikulum kami dirancang sistematis dari tingkat pemula hingga ahli, memastikan setiap siswa berkembang secara terstruktur dan terukur.
          </p>
        </div>

        {/* Grade Cards 1-5 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-20">
          {grades.map((grade) => (
            <Card key={grade.level} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:border-gold-500/50 transition-all hover:-translate-y-1">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-gold-500">
                  <grade.icon size={24} />
                </div>
                <CardTitle className="text-white text-xl">Grade {grade.level}</CardTitle>
                <div className="text-gold-500 font-medium text-sm">{grade.title}</div>
              </CardHeader>
              <CardContent className="text-center text-zinc-400 text-sm">
                {grade.desc}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sub-section: 3 Bulan per Grade */}
        <div className="bg-zinc-900/40 rounded-3xl p-8 md:p-12 border border-zinc-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-white mb-3">Durasi 3 Bulan per Grade</h3>
            <p className="text-zinc-400">Setiap grade ditempuh dalam 3 bulan dengan fokus yang bertahap.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {months.map((month) => (
              <div key={month.num} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/20 group-hover:bg-gold-500 transition-colors"></div>
                <div className="text-4xl font-black text-zinc-800 mb-4">{month.num}</div>
                <h4 className="text-white font-bold text-lg mb-2">{month.title}</h4>
                <p className="text-zinc-400 text-sm">{month.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
