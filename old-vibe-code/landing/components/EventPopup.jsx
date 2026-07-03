import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Music } from 'lucide-react';

// Data event (nantinya bisa diatur oleh admin lewat backend)
const eventData = {
  active: true, // Ubah ke false jika tidak ada event
  title: 'Legacy Music Show 2025',
  subtitle: 'Student Performance Night',
  date: '28 Juni 2025',
  time: '16.00 - 21.00 WIB',
  location: 'Legacy Music Center, Cirebon',
  description:
    'Saksikan penampilan memukau para murid berbakat Legacy Music Center dalam acara tahunan Student Performance Night. Nikmati pertunjukan piano, gitar, vokal, drums, dan masih banyak lagi!',
  image: '/Jumbotron4.webp',
  badge: '🎵 Event Spesial',
};

const EventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Muncul setelah splash screen (3 detik) + sedikit jeda
    if (eventData.active) {
      const timer = setTimeout(() => setIsVisible(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || !eventData.active) return null;

  return (
    <div className="event-overlay" onClick={() => setIsVisible(false)}>
      <div className="event-popup" onClick={(e) => e.stopPropagation()}>
        {/* Tombol Tutup */}
        <button className="event-close-btn" onClick={() => setIsVisible(false)}>
          <X size={20} />
        </button>

        {/* Badge */}
        <div className="event-badge">{eventData.badge}</div>

        {/* Gambar Event */}
        <div className="event-img-wrap">
          <img src={eventData.image} alt={eventData.title} className="event-img" />
          <div className="event-img-gradient" />
        </div>

        {/* Konten */}
        <div className="event-body">
          <h2 className="event-title">{eventData.title}</h2>
          <p className="event-subtitle">{eventData.subtitle}</p>

          <div className="event-details">
            <div className="event-detail-item">
              <Calendar size={15} />
              <span>{eventData.date}</span>
            </div>
            <div className="event-detail-item">
              <Clock size={15} />
              <span>{eventData.time}</span>
            </div>
            <div className="event-detail-item">
              <MapPin size={15} />
              <span>{eventData.location}</span>
            </div>
          </div>

          <p className="event-desc">{eventData.description}</p>

          <div className="event-actions">
            <a href="/login" className="event-btn-primary">
              <Music size={16} />
              Daftar Sekarang
            </a>
            <button className="event-btn-secondary" onClick={() => setIsVisible(false)}>
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
