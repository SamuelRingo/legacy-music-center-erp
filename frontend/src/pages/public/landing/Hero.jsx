import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLandingContent } from './useLandingContent';

const fallbackImages = [
  { src: '/Jumbotron1.webp', alt: 'Legacy Music 1' },
  { src: '/Jumbotron2.webp', alt: 'Legacy Music 2' },
  { src: '/Jumbotron3.webp', alt: 'Legacy Music 3' },
  { src: '/Jumbotron4.webp', alt: 'Legacy Music 4' },
  { src: '/Jumbotron5.webp', alt: 'Legacy Music 5' },
  { src: '/Jumbotron9.webp', alt: 'Aktivitas Murid Legacy Music 9' }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: contentData, loading } = useLandingContent('hero', {
    slider_1: '/Jumbotron1.webp',
    slider_2: '/Jumbotron2.webp',
    slider_3: '/Jumbotron3.webp',
    slider_4: '/Jumbotron4.webp',
    slider_5: '/Jumbotron5.webp',
    slider_6: '/Jumbotron6.webp',
    slider_7: '/Jumbotron7.webp',
    slider_8: '/Jumbotron8.webp',
    slider_9: '/Jumbotron9.webp'
  });

  // Convert content map to array of images
  const carouselImages = Object.keys(contentData || {})
    .filter(key => key.startsWith('slider_') && contentData[key])
    .sort() // Ensure slider_1 comes before slider_2
    .map((key, index) => ({
      src: contentData[key],
      alt: `Slider ${index + 1}`
    }));

  // Fallback just in case
  const slides = carouselImages.length > 0 ? carouselImages : fallbackImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading || !contentData) {
    return <div className="h-screen bg-zinc-950" />;
  }

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      {slides.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-zinc-950/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <img src="/logo.png" alt="Legacy Music Center" className="h-24 md:h-32 mb-8 drop-shadow-2xl" />
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight drop-shadow-lg">
          Inspirasi Musik <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-yellow-600">Tanpa Batas</span>
        </h1>
        
        <p className="text-base md:text-xl lg:text-2xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Wujudkan potensi dan <span className="text-white font-semibold">perkembangan kemampuan anak</span> melalui pendidikan musik kelas dunia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto justify-center">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold rounded-full px-8 py-6 text-lg transition-transform hover:scale-105">
              Daftar Sekarang
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto bg-transparent border-white text-white hover:text-gold-500 hover:border-gold-500 hover:bg-gold-500/10 rounded-full px-8 py-6 text-lg transition-all"
          >
            Pelajari Lebih Lanjut
          </Button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-gold-500 scale-125 shadow-lg shadow-gold-500/50' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white/50 hover:bg-gold-500/20 hover:text-gold-500 backdrop-blur-sm transition-all hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white/50 hover:bg-gold-500/20 hover:text-gold-500 backdrop-blur-sm transition-all hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>
    </section>
  );
}
