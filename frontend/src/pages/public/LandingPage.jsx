import { useState, useEffect } from 'react';
import api from '../../lib/api';
import SplashScreen from './landing/SplashScreen';
import Navbar from './landing/Navbar';
import Hero from './landing/Hero';
import About from './landing/About';
import Courses from './landing/Courses';
import Facility from './landing/Facility';
import Footer from './landing/Footer';
import EventPopup from './landing/EventPopup';
import ChatBotWidget from './landing/ChatBotWidget';
import GradeSection from './landing/GradeSection';
import EventSection from './landing/EventSection';

export default function LandingPage() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splash_shown');
  });
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get('/public/landing-content', { params: { section: 'hero' } }),
      api.get('/public/landing-content', { params: { section: 'about' } }),
      api.get('/public/landing-content', { params: { section: 'facility' } }),
      api.get('/public/landing-content', { params: { section: 'footer' } }),
      api.get('/public/landing-content', { params: { section: 'chatbot' } })
    ]).finally(() => {
      if (isMounted) {
        setDataReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isFullyReady = dataReady && !showSplash;

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-gold-500 selection:text-zinc-950 relative">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!isFullyReady && (
        <div className="fixed inset-0 bg-zinc-950 z-40" />
      )}
      
      <div 
        className={`transition-opacity duration-700 ease-in-out ${isFullyReady ? 'opacity-100' : 'opacity-0'}`}
      >
        <Navbar />
        <main>
          <Hero />
          <EventSection />
          <About />
          <Courses />
          <GradeSection />
          <Facility />
        </main>
        <Footer />
        <EventPopup />
        <ChatBotWidget />
      </div>
    </div>
  );
}
