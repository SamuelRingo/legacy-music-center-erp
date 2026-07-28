import { Instagram, Youtube, MessageCircle, MapPin, Mail, Phone, Clock } from 'lucide-react';
import { useLandingContent } from './useLandingContent';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';

export default function Footer() {
  const { data, loading } = useLandingContent('footer');

  const instagramMock = [
    '/Jumbotron1.webp', '/Jumbotron2.webp', '/Jumbotron3.webp', 
    '/Jumbotron4.webp', '/Jumbotron5.webp', '/Jumbotron6.webp'
  ];

  if (loading || !data) {
    return (
      <footer id="contact" className="bg-zinc-950 pt-24 pb-8 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <LoadingSkeleton type="card" count={1} />
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="bg-zinc-950 pt-24 pb-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
        
        {/* Kolom 1: Kontak */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gold-500 rounded-full"></span>
            Informasi Kontak
          </h3>
          <div className="space-y-5 text-zinc-400 text-sm md:text-base">
            {data.email && (
              <div className="flex items-start gap-4">
                <Mail size={18} className="text-gold-500 mt-1 shrink-0" />
                <span>{data.email}</span>
              </div>
            )}
            {data.hours && (
              <div className="flex items-start gap-4">
                <Clock size={18} className="text-gold-500 mt-1 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: data.hours }}></span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-start gap-4">
                <Phone size={18} className="text-gold-500 mt-1 shrink-0" />
                <span>{data.phone}</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mt-10 mb-5">Social Media</h3>
          <div className="flex gap-3">
            <a href={data.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-gold-500 hover:border-gold-500 transition-all shadow-lg hover:shadow-gold-500/20">
              <Instagram size={18} />
            </a>
            <a href={data.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-gold-500 hover:border-gold-500 transition-all shadow-lg hover:shadow-gold-500/20">
              <Youtube size={18} />
            </a>
            <a href={data.whatsapp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-gold-500 hover:border-gold-500 transition-all shadow-lg hover:shadow-gold-500/20">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        {/* Kolom 2: Instagram Widget */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gold-500 rounded-full"></span>
            Instagram Feed
          </h3>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {instagramMock.map((img, idx) => (
              <a key={idx} href={data.instagram} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden relative group border border-zinc-800 shadow-md">
                <img src={img} alt={`Instagram post ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/20 transition-colors flex items-center justify-center">
                  <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>
              </a>
            ))}
          </div>
          <a href={data.instagram} target="_blank" rel="noreferrer" className="text-sm font-medium text-gold-500 hover:text-gold-400 mt-5 inline-flex items-center gap-2 transition-colors">
            Follow Us &rarr;
          </a>
        </div>

        {/* Kolom 3: Google Maps */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-gold-500 rounded-full"></span>
            Lokasi Kami
          </h3>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-zinc-800 bg-zinc-900 aspect-video mb-6 relative group">
            <div className="absolute inset-0 bg-zinc-900 animate-pulse pointer-events-none group-hover:opacity-0 transition-opacity duration-1000 -z-10" />
            <iframe 
              src={data.maps_url} 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Lokasi Legacy Music"
              className="relative z-10"
            ></iframe>
          </div>
          <div className="flex items-start gap-4 text-zinc-400 text-sm leading-relaxed">
            <MapPin size={20} className="shrink-0 text-gold-500 mt-0.5" />
            <p dangerouslySetInnerHTML={{ __html: data.address }}></p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
           {/* <img src="/logo.png" alt="Logo" className="h-6" /> */}
        </div>
        <p className="text-zinc-500 text-xs md:text-sm font-medium">
          &copy; {new Date().getFullYear()} Legacy Music Center. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
