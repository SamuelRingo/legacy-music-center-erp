import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLandingContent } from './useLandingContent';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';

const fallbackImages = [
  { src: '/Jumbotron8.webp', alt: 'Aktivitas 1' },
  { src: '/Jumbotron9.webp', alt: 'Aktivitas 2' },
  { src: '/Admin1.webp',     alt: 'Tim Admin 1' },
  { src: '/Admin2.webp',     alt: 'Tim Admin 2' },
  { src: '/Admin3.webp',     alt: 'Tim Admin 3' },
];

export default function About() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const { data, loading } = useLandingContent('about', {
    title: 'Tempat Di Mana Musik Hidup',
    description: 'Legacy Music Center membuka dunia musik melalui bimbingan dari guru yang berpengalaman, paparan program transformatif dan akses ke fasilitas yang modern dan ceria.\n\nFakultas kami mempunyai guru-guru yang berdedikasi dan seniman komunikatif. Mereka telah berkompeten dalam mengajar musik, melatih ansambel, dan memberikan arahan terbaik kepada murid-murid.',
    stat_courses: '9+',
    stat_grades: '5',
    stat_teachers: '10+',
    image_1: '/Jumbotron8.webp',
    image_2: '/Admin1.webp',
    image_3: '/Admin2.webp'
  });

  const carouselImages = Object.keys(data || {})
    .filter(k => k.startsWith('image_') && (data || {})[k])
    .sort()
    .map(k => ({ src: (data || {})[k], alt: 'About Image' }));

  const slides = carouselImages.length > 0 ? carouselImages : fallbackImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setCurrentIdx((prev) => (prev + 1) % slides.length);

  if (loading || !data) {
    return (
      <section id="about" className="py-24 bg-zinc-900 text-zinc-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <LoadingSkeleton type="card" count={1} />
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 bg-zinc-900 text-zinc-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">
          About <span className="text-gold-500">Us</span>
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {data.title}
            </h3>
            <div className="space-y-4 text-lg whitespace-pre-wrap">
              {data.description}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
              <div className="text-center sm:text-left">
                <p className="text-4xl font-bold text-gold-500 mb-2">{data.stat_courses}</p>
                <p className="text-sm uppercase tracking-wider font-semibold">Jenis Kursus</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-4xl font-bold text-gold-500 mb-2">{data.stat_grades}</p>
                <p className="text-sm uppercase tracking-wider font-semibold">Grade Level</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-4xl font-bold text-gold-500 mb-2">{data.stat_teachers}</p>
                <p className="text-sm uppercase tracking-wider font-semibold">Instruktur</p>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group border border-zinc-800 aspect-[4/3]">
            {slides.map((img, index) => (
              <img
                key={index}
                src={img.src}
                alt={img.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentIdx ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

            <button 
              onClick={prev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-zinc-950/50 hover:bg-gold-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={next} 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-zinc-950/50 hover:bg-gold-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIdx(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIdx ? 'bg-gold-500 w-6' : 'bg-white/50 hover:bg-white'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
