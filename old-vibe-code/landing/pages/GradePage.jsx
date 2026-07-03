import React, { useState } from 'react';
import { Music, Star, Zap, Target, Award, Users, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import '../../landing/styles/landing.css';

const gradesData = [
  {
    id: 1,
    title: 'Grade 1',
    subtitle: 'Fase Pengenalan',
    icon: <Music size={32} />,
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.3)',
    unlocked: true,
    xp: 100,
    description: 'Mulai perjalanan musikmu! Di sini kamu akan mengenal berbagai jenis alat musik dan menemukan passion-mu.',
    skills: [
      'Pengenalan jenis alat musik (Piano, Gitar, Drums, dll)',
      'Mengetahui minat dan bakat alat musik',
      'Dasar-dasar teori musik',
      'Membangun ritme dan koordinasi dasar',
    ],
    months: [
      { month: 'Bulan 1', topic: 'Repertoir & Pengenalan Instrumen' },
      { month: 'Bulan 2', topic: 'Ujian Teori & Praktek Dasar' },
      { month: 'Bulan 3', topic: 'Student Performance' },
    ],
    badge: '🎵',
  },
  {
    id: 2,
    title: 'Grade 2',
    subtitle: 'Fase Pemahaman',
    icon: <Star size={32} />,
    color: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    unlocked: true,
    xp: 250,
    description: 'Kembangkan pemahamanmu tentang alat musik pilihan. Mulai pendalaman teknik dan teori.',
    skills: [
      'Teknik dasar instrumen pilihan',
      'Membaca notasi musik dasar',
      'Pendalaman teori musik lanjutan',
      'Latihan improvisasi sederhana',
    ],
    months: [
      { month: 'Bulan 1', topic: 'Repertoir & Teknik Dasar' },
      { month: 'Bulan 2', topic: 'Ujian Teori & Praktek Menengah' },
      { month: 'Bulan 3', topic: 'Student Performance' },
    ],
    badge: '⭐',
  },
  {
    id: 3,
    title: 'Grade 3',
    subtitle: 'Fase Pengembangan',
    icon: <Zap size={32} />,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    unlocked: true,
    xp: 500,
    description: 'Waktunya berkembang! Kuasai teknik-teknik lanjutan dan mulai eksplorasi gaya bermusikmu sendiri.',
    skills: [
      'Teknik instrumen tingkat lanjut',
      'Membaca partitur kompleks',
      'Pengembangan gaya & ekspresi musik',
      'Eksplorasi genre musik berbeda',
    ],
    months: [
      { month: 'Bulan 1', topic: 'Repertoir Lanjutan & Eksplorasi Genre' },
      { month: 'Bulan 2', topic: 'Ujian Teori & Praktek Lanjutan' },
      { month: 'Bulan 3', topic: 'Student Performance' },
    ],
    badge: '⚡',
  },
  {
    id: 4,
    title: 'Grade 4',
    subtitle: 'Fase Kolaborasi',
    icon: <Users size={32} />,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    unlocked: true,
    xp: 1000,
    description: 'Bergabunglah dengan band atau grup lain! Pelajari seni berkolaborasi dan tampil bersama musisi lain.',
    skills: [
      'Bermain ensemble dan band',
      'Teknik improvisasi grup',
      'Aransemen musik sederhana',
      'Koordinasi dan komunikasi musikal',
    ],
    months: [
      { month: 'Bulan 1', topic: 'Repertoir Ensemble & Band Practice' },
      { month: 'Bulan 2', topic: 'Ujian Kolaborasi & Aransemen' },
      { month: 'Bulan 3', topic: 'Group Performance Night' },
    ],
    badge: '🎸',
  },
  {
    id: 5,
    title: 'Grade 5',
    subtitle: 'Fase Improvisasi',
    icon: <Award size={32} />,
    color: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.4)',
    unlocked: true,
    xp: 2000,
    description: 'Level tertinggi! Kuasai seni improvisasi dan jadilah musisi yang sesungguhnya. Ini adalah puncak perjalananmu.',
    skills: [
      'Improvisasi tingkat mahir',
      'Komposisi musik original',
      'Penampilan profesional',
      'Mentoring murid junior',
    ],
    months: [
      { month: 'Bulan 1', topic: 'Repertoir & Komposisi Original' },
      { month: 'Bulan 2', topic: 'Final Exam: Teori & Praktek Master' },
      { month: 'Bulan 3', topic: 'Grand Student Performance' },
    ],
    badge: '🏆',
  },
];

const GradeCard = ({ grade, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`grade-card ${expanded ? 'expanded' : ''}`}
      style={{ '--grade-color': grade.color, '--grade-glow': grade.glowColor }}
    >
      {/* Nomor Level Background Besar */}
      <div className="grade-level-bg">{grade.id}</div>

      {/* Header Card */}
      <div className="grade-card-header">
        {/* Ikon & Badge */}
        <div className="grade-icon-wrap" style={{ color: grade.color }}>
          {grade.icon}
        </div>

        {/* Info Level */}
        <div className="grade-info">
          <div className="grade-badge-emoji">{grade.badge}</div>
          <h3 className="grade-title" style={{ color: grade.color }}>{grade.title}</h3>
          <p className="grade-subtitle">{grade.subtitle}</p>
        </div>

        {/* XP & Status */}
        <div className="grade-xp-block">
          <div className="grade-xp">{grade.xp} Poin</div>
          <div className="grade-status status-open">
            Tersedia
          </div>
        </div>

        {/* Tombol Expand */}
        <button
          className="grade-expand-btn"
          onClick={() => setExpanded(!expanded)}
          style={{ color: grade.color }}
        >
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>



      {/* Progress Bar XP */}
      <div className="grade-xp-bar-wrap">
        <div
          className="grade-xp-bar"
          style={{
            width: '100%',
            background: `linear-gradient(90deg, ${grade.color}, ${grade.glowColor})`,
          }}
        />
      </div>

      {/* Konten yang bisa di-expand */}
      {expanded && (
        <div className="grade-expanded-content">
          <p className="grade-desc">{grade.description}</p>

          <div className="grade-skills-section">
            <h4>
              <Target size={16} />
              Misi yang akan diselesaikan:
            </h4>
            <ul className="grade-skills-list">
              {grade.skills.map((skill, i) => (
                <li key={i} className="grade-skill-item" style={{ '--delay': `${i * 0.1}s` }}>
                  <span className="skill-dot" style={{ background: grade.color }} />
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div className="grade-months-section">
            <h4>
              <Music size={16} />
              Jadwal Quest:
            </h4>
            <div className="grade-months-grid">
              {grade.months.map((m, i) => (
                <div key={i} className="grade-month-card" style={{ borderColor: grade.color }}>
                  <div className="month-label" style={{ color: grade.color }}>{m.month}</div>
                  <div className="month-topic">{m.topic}</div>
                </div>
              ))}
            </div>
          </div>

          <a href="/login" className="grade-cta-btn" style={{ background: grade.color }}>
            Mulai Perjalanan Grade {grade.id} Sekarang
          </a>
        </div>
      )}
    </div>
  );
};

const GradePage = () => {
  return (
    <div className="grade-page">
      {/* Partikel Musik Background */}
      <div className="grade-bg-particles">
        {[...Array(30)].map((_, i) => {
          const notes = ['🎵', '🎶', '♩', '♪', '♫', '♬'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          return (
            <span
              key={i}
              className="bg-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 15}s`,
                fontSize: `${1 + Math.random() * 2}rem`,
                opacity: 0.05 + Math.random() * 0.15,
                color: 'var(--gold-primary)',
              }}
            >
              {randomNote}
            </span>
          );
        })}
      </div>

      {/* Header */}
      <div className="grade-page-header">
        <div className="grade-header-icon">
          <Award size={48} />
        </div>
        <h1 className="grade-page-title">
          Grade <span>Murid</span>
        </h1>
        <p className="grade-page-subtitle">
          Perjalanan musikmu dimulai dari Grade 1 menuju Fase Improvisasi di Grade 5.
          <br />
          Setiap grade berlangsung selama <strong>3 bulan</strong> dengan ujian teori dan praktek.
        </p>

        {/* Ringkasan XP */}
        <div className="grade-summary-bar">
          <div className="summary-item">
            <span className="summary-number">5</span>
            <span className="summary-label">Total Grade</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-number">15</span>
            <span className="summary-label">Total Bulan</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <span className="summary-number">3850</span>
            <span className="summary-label">Total Poin</span>
          </div>
        </div>
      </div>

      {/* Timeline Grade */}
      <div className="grade-timeline">
        <div className="timeline-line" />
        {gradesData.map((grade, index) => (
          <div key={grade.id} className="timeline-item">
            <div
              className="timeline-dot"
              style={{
                background: grade.color,
                boxShadow: `0 0 20px ${grade.glowColor}`,
              }}
            >
              {grade.id}
            </div>
            <GradeCard grade={grade} index={index} />
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="grade-footer-note">
        <Music size={20} />
        <p>
          Setiap grade memiliki durasi <strong>3 bulan</strong> dengan pembagian:&nbsp;
          <strong>Bulan 1</strong> Repertoir, <strong>Bulan 2</strong> Ujian (Teori/Praktek), <strong>Bulan 3</strong> Student Performance.
        </p>
      </div>
    </div>
  );
};

export default GradePage;
