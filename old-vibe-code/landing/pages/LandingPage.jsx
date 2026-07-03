import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Courses from '../components/Courses';
import Facility from '../components/Facility';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import SplashScreen from '../components/SplashScreen';
import EventPopup from '../components/EventPopup';
import '../styles/landing.css';

function LandingPage() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash if it hasn't been shown in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* Popup Event muncul setelah splash screen */}
      {!showSplash && <EventPopup />}

      {/* Konten website */}
      <div
        className="landing-page-root"
        style={{
          opacity: showSplash ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out',
          visibility: showSplash ? 'hidden' : 'visible',
          height: showSplash ? '100vh' : 'auto',
          overflow: showSplash ? 'hidden' : 'visible',
        }}
      >
        <Navbar />
        <Hero />
        <AboutUs />
        <Courses />
        <Facility />
        <Footer />
        <ChatBot />
      </div>
    </>
  );
}

export default LandingPage;
