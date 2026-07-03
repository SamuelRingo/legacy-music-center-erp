import React from 'react';
import { Instagram, Youtube, MessageCircle, MapPin } from 'lucide-react'; 

const Footer = () => {
  return (
    <footer id="contact">
      <div className="footer-grid">
        <div>
          <h3>Legacy Music Center</h3>
          <p style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <MapPin size={20} style={{ flexShrink: 0, marginTop: '4px' }} />
            <span>Jl. Dr. Setiabudi No.31-29, Kesambi, Kec. Kesambi, Kota Cirebon, Jawa Barat 45134, Indonesia</span>
          </p>
        </div>
        <div>
          <h3>Informasi Kontak</h3>
          <p>Email: info@legacy.sch.id</p>
          <p>Buka: Senin - Sabtu (09.00 - 20.00)</p>
          <p>Telepon: (+62) 821-1687-8041</p>
        </div>
        <div>
          <h3>Social Media</h3>
          <p>Temukan dan hubungi kami di:</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/legacy_music_center" target="_blank" rel="noreferrer" className="social-icon" title="Instagram">
              <Instagram />
            </a>
            <a href="https://youtube.com/@LegacyMusicCenter" target="_blank" rel="noreferrer" className="social-icon" title="YouTube">
              <Youtube />
            </a>
            <a href="https://api.whatsapp.com/send/?phone=6282116878041&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="social-icon" title="WhatsApp">
              <MessageCircle />
            </a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
        <p>&copy; {new Date().getFullYear()} Legacy Music Center. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
