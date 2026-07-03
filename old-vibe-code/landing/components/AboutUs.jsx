import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 5 gambar untuk slider About Us sesuai permintaan
const carouselImages = [
  { src: '/Jumbotron8.webp', alt: 'Aktivitas Murid Legacy Music 1' },
  { src: '/Jumbotron9.webp', alt: 'Aktivitas Murid Legacy Music 2' },
  { src: '/Admin1.webp',     alt: 'Tim Admin Legacy Music 1' },
  { src: '/Admin2.webp',     alt: 'Tim Admin Legacy Music 2' },
  { src: '/Admin3.webp',     alt: 'Tim Admin Legacy Music 3' },
];

const AboutUs = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Auto-scroll setiap 3 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrentIdx((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  const next = () => setCurrentIdx((prev) => (prev + 1) % carouselImages.length);

  return (
    <section id="about">
      <h2 className="section-title">About Us</h2>
      <div className="about-grid">
        {/* Konten Teks */}
        <div className="about-content">
          <div className="about-badge">Legacy Music Center</div>
          <h3 className="about-heading">
            Tempat Di Mana Musik <span style={{ color: 'var(--primary)' }}>Hidup</span>
          </h3>
          <p>
            Legacy Music Center membuka dunia musik melalui bimbingan dari guru yang berpengalaman,
            paparan program transformatif dan akses ke fasilitas yang modern dan ceria.
          </p>
          <br />
          <p>
            Fakultas kami mempunyai guru-guru yang berdedikasi dan seniman komunikatif.
            Mereka telah berkompeten dalam mengajar musik, melatih ansambel, dan memberikan
            arahan terbaik kepada murid-murid.
          </p>

          {/* Statistik */}
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">9+</span>
              <span className="stat-label">Jenis Kursus</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Grade Level</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10+</span>
              <span className="stat-label">Instruktur</span>
            </div>
          </div>
        </div>

        {/* Carousel Gambar */}
        <div className="about-carousel">
          {carouselImages.map((img, index) => (
            <img
              key={index}
              src={img.src}
              alt={img.alt}
              className={`carousel-img ${index === currentIdx ? 'active' : ''}`}
            />
          ))}

          {/* Tombol Prev/Next */}
          <button className="carousel-arrow prev" onClick={prev} aria-label="Sebelumnya">
            <ChevronLeft size={20} />
          </button>
          <button className="carousel-arrow next" onClick={next} aria-label="Berikutnya">
            <ChevronRight size={20} />
          </button>

          {/* Titik indikator */}
          <div className="carousel-dots">
            {carouselImages.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentIdx ? 'active' : ''}`}
                onClick={() => setCurrentIdx(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
