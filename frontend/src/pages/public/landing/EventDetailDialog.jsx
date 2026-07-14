import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { CalendarDays } from 'lucide-react';

export default function EventDetailDialog({ event, open, onOpenChange }) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        style={{ outline: 'none' }}
        className="sm:max-w-xl bg-zinc-950 border border-zinc-800 text-white p-0 overflow-hidden outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
      >
        {/* Gambar Event */}
        <div className="w-full h-48 md:h-64 relative">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        </div>

        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gold-500">
              {event.title}
            </DialogTitle>
          </DialogHeader>

          {/* Tanggal (Jika ada createdAt atau eventDate) */}
          {event.createdAt && (
            <div className="flex items-center text-sm text-zinc-400 mb-4">
              <CalendarDays className="h-4 w-4 mr-2" />
              {new Date(event.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}

          {/* Deskripsi */}
          <div className="text-zinc-300 mb-6 whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {event.description}
          </div>

          <div className="flex justify-end">
            <DialogClose asChild>
              <button className="inline-flex items-center justify-center border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-zinc-950 px-4 py-2 rounded-md font-medium text-sm transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none">
                Tutup
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
