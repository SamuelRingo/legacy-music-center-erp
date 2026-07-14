import { useState } from 'react';
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

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-gold-500 selection:text-zinc-950">
      <SplashScreen onComplete={() => setShowSplash(false)} />
      
      <div 
        className="transition-opacity duration-1000"
        style={{ opacity: showSplash ? 0 : 1 }}
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
