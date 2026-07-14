import { useState, useEffect } from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventDetailDialog from './landing/EventDetailDialog';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    const fetchEvents = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const res = await axios.get(`${baseUrl}/public/events`);
        setEvents(res.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-gold-500 selection:text-zinc-950 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-gold-500 mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" /> Kembali ke Beranda
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white uppercase tracking-tight">
            Semua <span className="text-gold-500">Event</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Kumpulan seluruh acara, kompetisi, dan konser dari Legacy Music Center.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-16 text-center">
            <CalendarDays className="mx-auto h-20 w-20 text-zinc-600 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Belum ada event</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Saat ini kami belum memiliki event yang dijadwalkan. Terus kunjungi halaman ini untuk update terbaru!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card 
                key={event.id} 
                style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                className="bg-zinc-900/40 border-zinc-800 overflow-hidden hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/20 transition-all group flex flex-col h-full cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ring-0 ring-offset-0"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="h-56 overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <CardHeader className="shrink-0">
                  <CardTitle className="text-white text-xl md:text-2xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-zinc-400 text-sm whitespace-pre-wrap line-clamp-4">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <EventDetailDialog 
        event={selectedEvent} 
        open={!!selectedEvent} 
        onOpenChange={(open) => !open && setSelectedEvent(null)} 
      />
    </div>
  );
}
