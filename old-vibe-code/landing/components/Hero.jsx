import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 7 gambar Jumbotron sebagai latar belakang yang bergantian
const heroImages = [
  '/Jumbotron1.webp',
  '/Jumbotron2.webp',
  '/Jumbotron3.webp',
  '/Jumbotron4.webp',
  '/Jumbotron5.webp',
  '/Jumbotron6.webp',
  '/Jumbotron7.webp',
];

const Hero = () => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="hero">
      {/* Layer gambar latar belakang yang bergantian */}
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          className={`hero-bg-slide ${idx === currentBg ? 'active' : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Overlay gelap agar teks tetap terbaca */}
      <div className="hero-overlay" />

      {/* Konten Hero */}
      <div className="hero-content">
        {/* Logo Legacy Music Center */}
        <div className="hero-logo-wrapper">
          <img
            src="/Logolegacymusic.webp"
            alt="Legacy Music Center Logo"
            className="hero-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <p className="hero-tagline">
          <span className="tagline-main">Inspirasi Musik tanpa Batas</span>
          <br />
          <span className="tagline-sub">Perkembangan kemampuan Anak</span>
        </p>

        <div className="hero-actions">
          <Link to="/login" className="btn-enroll">Daftar Sekarang</Link>
          <a href="#about" className="btn-secondary-hero">Pelajari Lebih Lanjut</a>
        </div>

        {/* Indikator slide bawah */}
        <div className="hero-dots">
          {heroImages.map((_, idx) => (
            <span
              key={idx}
              className={`hero-dot ${idx === currentBg ? 'active' : ''}`}
              onClick={() => setCurrentBg(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
