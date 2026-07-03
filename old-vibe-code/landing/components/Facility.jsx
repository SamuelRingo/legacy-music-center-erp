import React from 'react';

const facilities = [
  {
    title: 'Piano',
    desc: "Dive into the enchanting realm of piano music with our expert instructors. Whether you're a complete beginner or an intermediate player looking to refine your skills, our courses cater to all levels of expertise.",
    img: '/Piano.webp',
  },
  {
    title: 'Violin',
    desc: 'Our instructors are not just educators; they are passionate mentors dedicated to nurturing your love for the violin. Learn from their expertise, guidance, and infectious enthusiasm for the beauty of string instruments.',
    img: '/Violin.webp',
  },
  {
    title: 'Vocal',
    desc: 'Our Vocal Courses cater to all vocal enthusiasts, from beginners seeking to find their voice to seasoned singers aiming to refine their skills. Explore the nuances of pitch, tone, and expression under the guidance of our expert instructors.',
    img: '/Vocal.webp',
  },
  {
    title: 'Guitar',
    desc: 'Immerse yourself in the joy of playing guitar, connect with fellow enthusiasts, and let the magic of strings become an integral part of your musical identity.',
    img: '/Guitar.webp',
  },
  {
    title: 'The Elegance of Simplicity',
    desc: 'Our cozy waiting room is adorned with clean lines, neutral tones, and carefully curated decor, providing an environment that exudes both warmth and refinement.',
    img: '/Sofa.webp',
  },
  {
    title: 'Drums',
    desc: "Whether you're a drumming novice or an experienced percussionist, our courses cater to all skill levels. Learn the basics, explore intricate rhythms, and discover the dynamic world of drumming through our comprehensive curriculum.",
    img: '/Drums.webp',
  },
];

const Facility = () => {
  return (
    <section id="facility">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title">Facility</h2>
        <p style={{ color: '#aaa', marginTop: '1.5rem' }}>
          Raih kreativitas studi musik dan seni pertunjukan Anda
        </p>
      </div>
      <div className="facility-grid">
        {facilities.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-img-wrap">
              <img
                src={item.img}
                alt={item.title}
                className="card-img"
                onError={(e) => { e.target.style.opacity = '0.3'; }}
              />
            </div>
            <div className="card-body">
              <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.4rem' }}>
                {item.title}
              </h3>
              <div style={{ height: '1px', backgroundColor: 'rgba(212,175,55,0.3)', width: '80%', margin: '0 auto 1.5rem' }} />
              <p style={{ textAlign: 'center', fontSize: '0.95rem', lineHeight: '1.7', color: '#aaa' }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Facility;
