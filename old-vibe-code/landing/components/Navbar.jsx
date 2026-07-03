import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo Resmi */}
      <a href="#home" className="nav-brand">
        <img
          src="/Logolegacymusic.webp"
          alt="Legacy Music Center"
          className="nav-logo-img"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span className="nav-logo-fallback" style={{ display: 'none' }}>
          Legacy<span>Music</span>
        </span>
      </a>

      {/* Menu Desktop */}
      <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
        <li><a href="#home" onClick={() => setMenuOpen(false)}>Home</a></li>
        <li><a href="#about" onClick={() => setMenuOpen(false)}>About Us</a></li>
        <li><a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a></li>
        <li><a href="#facility" onClick={() => setMenuOpen(false)}>Facility</a></li>
        <li><Link to="/grade" onClick={() => setMenuOpen(false)}>Grade</Link></li>
        <li><Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link></li>
        <li><Link to="/login" className="btn-enroll" onClick={() => setMenuOpen(false)}>Enroll</Link></li>
      </ul>

      {/* Hamburger Mobile */}
      <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;
