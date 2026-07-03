import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Tunggu 2 detik, lalu mulai animasi memudar (fade out)
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Tunggu 1 detik lagi sampai animasi memudar benar-benar selesai
    const timer2 = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <h1 className="splash-title">WELCOME TO</h1>
        <h2 className="splash-brand">LEGACY <span style={{ color: 'var(--primary)' }}>MUSIC</span></h2>
        <div className="splash-loader"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
