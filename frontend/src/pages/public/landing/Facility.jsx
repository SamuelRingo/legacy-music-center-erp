import { Card, CardContent } from '@/components/ui/card';
import { useLandingContent } from './useLandingContent';

const fallbackFacilities = [
  { title: 'Piano', desc: "Dive into the enchanting realm of piano music with our expert instructors...", img: '/Piano.webp' },
  { title: 'Violin', desc: 'Our instructors are not just educators; they are passionate mentors dedicated to nurturing your love for the violin...', img: '/Violin.webp' },
  { title: 'Vocal', desc: 'Our Vocal Courses cater to all vocal enthusiasts, from beginners seeking to find their voice to seasoned singers...', img: '/Vocal.webp' },
  { title: 'Guitar', desc: 'Immerse yourself in the joy of playing guitar, connect with fellow enthusiasts, and let the magic of strings become an integral part of your musical identity.', img: '/Guitar.webp' },
  { title: 'The Elegance of Simplicity', desc: 'Our cozy waiting room is adorned with clean lines, neutral tones, and carefully curated decor, providing an environment that exudes both warmth and refinement.', img: '/Sofa.webp' },
  { title: 'Drums', desc: "Whether you're a drumming novice or an experienced percussionist, our courses cater to all skill levels. Learn the basics, explore intricate rhythms...", img: '/Drums.webp' },
];

export default function Facility() {
  const { data } = useLandingContent('facility');

  const facilities = [];
  for (let i = 1; i <= 6; i++) {
    const titleKey = `f${i}_title`;
    const descKey = `f${i}_desc`;
    const imgKey = `f${i}_img`;
    
    if (data[titleKey] || data[descKey] || data[imgKey]) {
      facilities.push({
        title: data[titleKey] || fallbackFacilities[i - 1].title,
        desc: data[descKey] || fallbackFacilities[i - 1].desc,
        img: data[imgKey] || fallbackFacilities[i - 1].img
      });
    } else {
      facilities.push(fallbackFacilities[i - 1]);
    }
  }

  return (
    <section id="facility" className="py-24 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-gold-500">Facility</span>
          </h2>
          <p className="text-zinc-400">Raih kreativitas studi musik dan seni pertunjukan Anda</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((item, index) => (
            <Card key={index} className="bg-zinc-950 border-zinc-800 overflow-hidden group">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  onError={(e) => { e.target.style.opacity = '0.3'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
              </div>
              <CardContent className="p-6 text-center relative z-10 -mt-10">
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <div className="h-[2px] w-16 bg-gold-500/50 mx-auto mb-4" />
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
