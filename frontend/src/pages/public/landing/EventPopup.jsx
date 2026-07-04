import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api';

export default function EventPopup() {
  const [open, setOpen] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/public/events');
        if (res.data && res.data.length > 0) {
          const formattedEvents = res.data.map(ev => ({
            id: ev.id,
            title: ev.title,
            subtitle: 'Event Legacy Music',
            description: ev.description || 'Saksikan penampilan memukau para murid berbakat Legacy Music Center!',
            image: ev.imageUrl || '/Jumbotron4.webp',
            badge: 'Event Spesial',
          }));
          
          setEventsData(formattedEvents);
          setTimeout(() => setOpen(true), 5000);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  if (eventsData.length === 0) return null;

  const getCardStyle = (index) => {
    const diff = index - activeIndex;
    
    // Hide cards that are passed (swipe left out)
    if (diff < 0) {
      return {
        zIndex: 0,
        opacity: 0,
        transform: 'translateX(-40px) scale(0.95)',
        pointerEvents: 'none'
      };
    }
    
    // Hide cards that are deeper than 3 in the stack
    if (diff > 2) {
      return {
        zIndex: 0,
        opacity: 0,
        transform: 'translate(40px, -20px) scale(0.85)',
        pointerEvents: 'none'
      };
    }

    const zIndex = 30 - diff * 10;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    const translateX = diff === 0 ? 0 : diff === 1 ? (isMobile ? 10 : 15) : (isMobile ? 20 : 30);
    let translateY = diff === 0 ? 0 : diff === 1 ? (isMobile ? -6 : -10) : (isMobile ? -12 : -20);
    const scale = diff === 0 ? 1 : diff === 1 ? 0.95 : 0.90;
    let opacity = diff === 0 ? 1 : diff === 1 ? 0.8 : 0.5;

    // FASE 5: Hover Effect untuk kartu di belakang
    if (hoveredIndex === index && diff > 0) {
      translateY -= 8; // Naik sedikit setara -translate-y-2
      opacity = diff === 1 ? 1 : 0.7; // Opacity lebih terang saat di-hover
    }

    return {
      zIndex,
      opacity,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      // Active card is normal, background cards only have pointer-events on their exposed part
      // This works naturally because the front card blocks clicks for the overlapping area!
      pointerEvents: 'auto', 
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="bg-transparent shadow-none border-none text-zinc-100 !w-[90vw] md:!w-[900px] !max-w-[95vw] md:!max-w-[900px] h-[85vh] md:h-[500px] p-0 overflow-visible outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 ring-offset-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">Event Promo</DialogTitle>
        <DialogDescription className="sr-only">Detail Event Legacy Musik</DialogDescription>
        
        <div className="relative w-full h-full outline-none focus:outline-none focus-visible:outline-none border-none ring-0">
          {eventsData.map((eventData, index) => {
            const diff = index - activeIndex;
            return (
              <div 
                key={eventData.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  // Allow clicking background cards to bring them to front
                  if (diff > 0) setActiveIndex(index);
                }}
                className={`absolute inset-0 flex flex-row w-full h-full min-h-[300px] md:h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out outline-none focus:outline-none focus-visible:outline-none ring-0 ${diff > 0 ? 'cursor-pointer' : ''}`}
                style={getCardStyle(index)}
              >
                {/* Kolom Kiri: GAMBAR 60% */}
                <div className="w-[60%] relative h-full shrink-0">
                  <img 
                    src={eventData.image} 
                    alt={eventData.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.src = '/Jumbotron4.webp'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/50" />
                  <div className="absolute top-4 left-4 bg-gold-500 text-zinc-950 font-bold px-3 py-1 rounded-full text-[10px] md:text-xs shadow-md">
                    {eventData.badge}
                  </div>
                </div>

                {/* Kolom Kanan: TEKS 40% */}
                <div className="w-[40%] h-full bg-zinc-900 p-4 md:p-6 flex flex-col relative z-10 shrink-0 overflow-y-auto outline-none focus:outline-none focus-visible:outline-none ring-0 border-none">
                  
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1 leading-tight break-words pr-6 outline-none focus:outline-none">{eventData.title}</h2>
                  <p className="text-gold-500 text-xs md:text-sm font-medium mb-4">{eventData.subtitle}</p>

                  <p className="text-zinc-400 text-xs md:text-sm mb-6 leading-relaxed">
                    {eventData.description}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto pt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation(); // Cegah propagasi agar tidak memicu onClick wrapper card
                        if (diff === 0) setOpen(false); // Hanya card terdepan yang bisa ditutup
                      }} 
                      disabled={diff !== 0} // Matikan tombol untuk card di belakang
                      className="w-full bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold text-xs md:text-sm h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-md md:rounded-xl transition-all disabled:opacity-50"
                    >
                      Tutup
                    </Button>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Counter Teks */}
          {eventsData.length > 1 && (
            <div className="absolute -top-8 left-0 text-zinc-300 text-xs md:text-sm font-medium z-40">
              Event {activeIndex + 1} dari {eventsData.length}
            </div>
          )}

          {/* Navigasi Kiri */}
          {eventsData.length > 1 && activeIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveIndex(Math.max(0, activeIndex - 1)) }}
              className="absolute -left-6 md:-left-16 top-1/2 -translate-y-1/2 z-40 bg-zinc-800 p-2 md:p-3 rounded-full text-white shadow-xl hover:bg-gold-500 hover:text-zinc-900 transition-colors border border-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <ChevronLeft size={24} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Navigasi Kanan */}
          {eventsData.length > 1 && activeIndex < eventsData.length - 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveIndex(Math.min(eventsData.length - 1, activeIndex + 1)) }}
              className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2 z-40 bg-zinc-800 p-2 md:p-3 rounded-full text-white shadow-xl hover:bg-gold-500 hover:text-zinc-900 transition-colors border border-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <ChevronRight size={24} className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}

          {/* Indikator Dot */}
          {eventsData.length > 1 && (
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-2 z-40">
              {eventsData.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    idx === activeIndex ? 'w-6 h-2 bg-gold-500' : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-400'
                  }`}
                  aria-label={`Go to event ${idx + 1}`}
                />
              ))}
              {eventsData.length > 5 && (
                <span className="text-zinc-500 text-xs ml-1 tracking-widest">...</span>
              )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
