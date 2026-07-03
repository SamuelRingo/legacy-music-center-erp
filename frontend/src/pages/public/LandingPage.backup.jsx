import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      setErrorEvents(false);
      try {
        const res = await api.get('/public/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setErrorEvents(true);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center">
                <span className="text-white dark:text-zinc-900 font-bold text-xl">L</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                Legacy Musik
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-semibold shadow-lg shadow-zinc-900/10 dark:shadow-none hover:shadow-xl transition-all">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900 pt-20 pb-32">
          <div className="absolute inset-0 z-0">
            <img 
              src="/auth-bg.png" 
              alt="Background pattern" 
              className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.1]"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              Pendaftaran Siswa Baru Telah Dibuka
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-8 max-w-4xl mx-auto leading-tight">
              Kembangkan Bakat Musikmu Bersama Kami
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Fasilitas premium, mentor berpengalaman, dan kurikulum berstandar internasional. Mari wujudkan mimpimu di Legacy Musik Studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto shadow-xl shadow-zinc-900/10">
                  Mulai Perjalananmu
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto bg-white dark:bg-zinc-950">
                Lihat Program Kami
              </Button>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                Acara Mendatang
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                Jangan lewatkan konser, workshop, dan masterclass eksklusif dari kami.
              </p>
            </div>

            {loadingEvents ? (
              <LoadingSkeleton type="card" rows={3} />
            ) : errorEvents ? (
              <ErrorState onRetry={() => {
                setLoadingEvents(true);
                api.get('/public/events').then(res => setEvents(res.data)).catch(() => setErrorEvents(true)).finally(() => setLoadingEvents(false));
              }} />
            ) : events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="group relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 relative">
                      <div className="absolute -top-6 right-6 bg-white dark:bg-zinc-950 px-4 py-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">
                        {new Date(event.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Belum Ada Acara" description="Nantikan update acara terbaru dari kami." />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-zinc-950 font-bold">L</span>
            </div>
            <span className="font-bold text-lg text-white">Legacy Musik</span>
          </div>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Legacy Musik Studio. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
