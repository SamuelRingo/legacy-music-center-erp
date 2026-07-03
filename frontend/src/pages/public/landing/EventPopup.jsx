import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';

export default function EventPopup() {
  const [open, setOpen] = useState(false);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get('/public/events');
        if (res.data && res.data.length > 0) {
          const activeEvent = res.data[0];
          setEventData({
            title: activeEvent.title,
            subtitle: 'Event Legacy Music',
            date: new Date(activeEvent.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: '18:00 WIB',
            location: 'Legacy Music Center',
            description: activeEvent.description || 'Saksikan penampilan memukau para murid berbakat Legacy Music Center!',
            image: activeEvent.imageUrl || '/Jumbotron4.webp',
            badge: 'Event Spesial',
          });
          
          setTimeout(() => setOpen(true), 5000);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvent();
  }, []);

  if (!eventData) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="bg-zinc-900 border-none text-zinc-100 !w-[90vw] md:!w-[900px] !max-w-[95vw] md:!max-w-[900px] max-h-[85vh] md:max-h-[500px] p-0 overflow-hidden rounded-2xl outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [&>button]:text-zinc-400 [&>button:hover]:text-white [&>button]:focus:outline-none [&>button]:focus:ring-0 [&>button]:ring-offset-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Event Promo</DialogTitle>
        <DialogDescription className="sr-only">Detail Event Legacy Musik</DialogDescription>
        
        <div className="flex flex-row w-full h-full min-h-[300px] md:h-[500px]">
          {/* Kolom Kiri: GAMBAR 60% */}
          <div className="w-[60%] relative h-full shrink-0">
            <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/50" />
            <div className="absolute top-4 left-4 bg-gold-500 text-zinc-950 font-bold px-3 py-1 rounded-full text-[10px] md:text-xs shadow-md">
              {eventData.badge}
            </div>
          </div>

          {/* Kolom Kanan: TEKS 40% */}
          <div className="w-[40%] h-full bg-zinc-900 p-4 md:p-6 flex flex-col relative z-10 shrink-0 overflow-y-auto">
            
            <h2 className="text-lg md:text-2xl font-bold text-white mb-1 leading-tight break-words pr-6">{eventData.title}</h2>
            <p className="text-gold-500 text-xs md:text-sm font-medium mb-4">{eventData.subtitle}</p>

            <div className="flex flex-col gap-2 mb-4">
              <div className="text-[10px] md:text-xs text-zinc-300 bg-zinc-800/80 p-2 rounded-md">
                <span className="block text-gold-500 font-bold mb-0.5">Tanggal</span>
                {eventData.date}
              </div>
              <div className="text-[10px] md:text-xs text-zinc-300 bg-zinc-800/80 p-2 rounded-md">
                <span className="block text-gold-500 font-bold mb-0.5">Waktu</span>
                {eventData.time}
              </div>
              <div className="text-[10px] md:text-xs text-zinc-300 bg-zinc-800/80 p-2 rounded-md">
                <span className="block text-gold-500 font-bold mb-0.5">Lokasi</span>
                <span className="line-clamp-2">{eventData.location}</span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs md:text-sm mb-6 leading-relaxed">
              {eventData.description}
            </p>

            {/* Actions */}
            <div className="mt-auto pt-2">
              <Link to="/register" onClick={() => setOpen(false)} className="w-full block">
                <Button className="w-full bg-gold-500 hover:bg-gold-600 text-zinc-950 font-bold text-xs md:text-sm h-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 rounded-md md:rounded-xl transition-all">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
