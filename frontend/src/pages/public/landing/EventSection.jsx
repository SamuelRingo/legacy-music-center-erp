import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventDetailDialog from './EventDetailDialog';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Asumsi API terpasang di localhost:3001/api/public/events (atau dari env)
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const res = await axios.get(`${baseUrl}/public/events`);
        setEvents(res.data.slice(0, 3)); // Ambil max 3 terbaru
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-12 bg-zinc-900 border-t border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white uppercase tracking-tight">
              Acara & <span className="text-gold-500">Event</span> Terbaru
            </h2>
            <p className="text-zinc-400 text-lg">
              Jangan lewatkan konser rutin, workshop eksklusif, dan acara spesial dari Legacy Music Center.
            </p>
          </div>
          <Link to="/events">
            <Button variant="outline" className="border-gold-500 !text-gold-500 hover:bg-gold-500 hover:!text-white font-bold rounded-full px-6">
              Lihat Semua Event <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-zinc-800 animate-pulse rounded-xl border border-zinc-700"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center">
            <CalendarDays className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Belum ada event terbaru</h3>
            <p className="text-zinc-400">Nantikan pengumuman acara menarik dari kami selanjutnya!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="bg-zinc-950 border-zinc-800 overflow-hidden hover:border-gold-500/50 hover:shadow-lg hover:shadow-gold-500/20 transition-all group cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-xl line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm line-clamp-3">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <EventDetailDialog 
        event={selectedEvent} 
        open={!!selectedEvent} 
        onOpenChange={(open) => !open && setSelectedEvent(null)} 
      />
    </section>
  );
}
