import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Has it been shown in this session?
    const hasShown = sessionStorage.getItem('splash_shown');
    if (hasShown) {
      setVisible(false);
      onComplete?.();
      return;
    }

    // Play animation for 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('splash_shown', 'true');
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 transition-opacity duration-500">
      <div className="flex flex-col items-center animate-pulse">
        <img src="/Logolegacymusic.webp" alt="Legacy Music Center" className="w-48 md:w-64 mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
        <h1 className="text-gold-500 font-bold text-2xl tracking-widest uppercase">Legacy Music Center</h1>
      </div>
    </div>
  );
}
