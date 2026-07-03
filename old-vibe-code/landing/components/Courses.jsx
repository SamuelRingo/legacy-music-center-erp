import React, { useState } from 'react';
import { X, Music, Clock, Users, Star } from 'lucide-react';

const coursesData = [
  {
    name: 'Piano',
    image: '/Piano1.jpg',
    teachers: [
      { name: 'Stefan', photo: '/Stefan.webp' },
      { name: 'Rizky', photo: '/Rizky.webp' },
    ],
    description: 'Selami dunia musik piano yang memukau bersama instruktur berpengalaman kami. Mulai dari pemula hingga tingkat lanjut, kursus ini dirancang untuk semua kalangan.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Gitar',
    image: '/Gitar1.jpg',
    teachers: [
      { name: 'Afif', photo: '/Afif.webp' },
    ],
    description: 'Rasakan kegembiraan bermain gitar dan temukan identitas musikal Anda. Dari chord dasar hingga teknik fingerpicking yang kompleks.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Drums',
    image: '/Drums1.jpg',
    teachers: [
      { name: 'Budi', photo: '/Budi.webp' },
      { name: 'Umae', photo: '/Umae.webp' },
    ],
    description: 'Pelajari ritme dan teknik perkusi dari instruktur profesional. Dari ketukan dasar hingga pola drumming yang kompleks untuk berbagai genre musik.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Saxophone',
    image: '/Saxophone1.jpg',
    teachers: [
      { name: 'Egi', photo: '/Egi.webp' },
    ],
    description: 'Kuasai instrumen tiup yang penuh ekspresi ini. Pelajari teknik pernafasan, fingering, dan interpretasi musik dari instruktur berpengalaman.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Violin',
    image: '/Violin1.jpg',
    teachers: [
      { name: 'Iwan', photo: '/Iwan.webp' },
    ],
    description: 'Eksplorasi keindahan melodi dari instrumen gesek yang elegan. Belajar teknik bow, postur yang benar, dan interpretasi musik klasik maupun kontemporer.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Vocal',
    image: '/Vocal1.jpg',
    teachers: [
      { name: 'Egi', photo: '/Egi.webp' },
      { name: 'Angel', photo: '/Angel.webp' },
      { name: 'Betha', photo: '/Betha.webp' },
      { name: 'Rizky', photo: '/Rizky.webp' },
    ],
    description: 'Temukan dan kembangkan suara unik Anda. Kursus vokal kami mencakup teknik pernafasan, pitch, tone, dan penampilan di atas panggung.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Combo Class',
    image: '/Comboclass1.jpg',
    teachers: [
      { name: 'Coming Soon!', photo: null },
    ],
    description: 'Kelas kolaborasi ensemble di mana Anda bisa bermain bersama musisi lain. Belajar aransemen, koordinasi, dan tampil sebagai sebuah band.',
    duration: '3 Bulan per Grade',
    level: 'Intermediate+',
    grade: 'Grade 3 - 5',
  },
  {
    name: 'Cello',
    image: '/Cello1.jpg',
    teachers: [
      { name: 'Stefan', photo: '/Stefan.webp' },
    ],
    description: 'Pelajari instrumen gesek yang kaya suara dan ekspresif ini. Dari posisi dasar hingga teknik bow yang kompleks untuk repertoire klasik maupun modern.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
  {
    name: 'Music Production',
    image: '/Musicproduction1.jpg',
    teachers: [
      { name: 'Coming Soon!', photo: null },
    ],
    description: 'Belajar membuat musik digital dari awal. Meliputi DAW, mixing, mastering, sound design, dan cara memproduksi lagu profesional dari rumah.',
    duration: '3 Bulan per Grade',
    level: 'Semua Level',
    grade: 'Grade 1 - 5',
  },
];

// Komponen Modal Detail Course
const CourseModal = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Gambar Header Modal */}
        <div className="modal-img-wrap">
          <img src={course.image} alt={course.name} className="modal-course-img" />
          <div className="modal-img-overlay">
            <h2 className="modal-title">{course.name}</h2>
          </div>
        </div>

        {/* Body Modal */}
        <div className="modal-body">
          {/* Info Singkat */}
          <div className="modal-info-row">
            <div className="modal-info-item">
              <Clock size={16} />
              <span>{course.duration}</span>
            </div>
            <div className="modal-info-item">
              <Star size={16} />
              <span>{course.level}</span>
            </div>
            <div className="modal-info-item">
              <Music size={16} />
              <span>{course.grade}</span>
            </div>
          </div>

          {/* Deskripsi */}
          <p className="modal-desc">{course.description}</p>

          {/* Daftar Guru */}
          <div className="modal-teachers-section">
            <h4 className="modal-teachers-title">
              <Users size={16} />
              Instruktur
            </h4>
            <div className="modal-teachers-grid">
              {course.teachers.map((teacher, idx) => (
                <div key={idx} className="modal-teacher-card">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="modal-teacher-photo"
                      onError={(e) => { e.target.src = '/Logolegacymusic.webp'; }}
                    />
                  ) : (
                    <div className="modal-teacher-placeholder">
                      <Users size={24} />
                    </div>
                  )}
                  <span className="modal-teacher-name">{teacher.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Daftar */}
          {course.teachers.some(t => t.name === 'Coming Soon!') ? (
            <button className="modal-enroll-btn disabled" disabled style={{ cursor: 'not-allowed', opacity: 0.5, border: 'none', width: '100%' }}>
              Kelas Segera Hadir
            </button>
          ) : (
            <a href="/login" className="modal-enroll-btn">
              Daftar Kursus Ini
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <section id="courses">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title">Courses</h2>
        <p style={{ color: '#aaa', marginTop: '1.5rem' }}>
          Klik setiap kursus untuk melihat detail dan instruktur
        </p>
      </div>

      <div className="courses-grid">
        {coursesData.map((course, idx) => (
          <div
            className="course-card"
            key={idx}
            onClick={() => setSelectedCourse(course)}
            style={{ cursor: 'pointer' }}
          >
            {/* Gambar Course */}
            <div className="course-img-wrap">
              <img
                src={course.image}
                alt={course.name}
                className="course-img"
                onError={(e) => { e.target.style.opacity = '0.3'; }}
              />
            </div>

            <h3 className="course-name">{course.name}</h3>
            <div className="divider" />

            {/* Daftar Guru */}
            <div className="teachers-list">
              {course.teachers.map((teacher, tidx) => (
                <div key={tidx} className="teacher-item">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="teacher-avatar"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="avatar-placeholder-icon">
                      <Users size={14} />
                    </div>
                  )}
                  <span>{teacher.name}</span>
                </div>
              ))}
            </div>

            <div className="course-click-hint">Klik untuk detail →</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </section>
  );
};

export default Courses;
