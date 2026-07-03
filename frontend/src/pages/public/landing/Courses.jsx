import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import CourseModal from './CourseModal';
import { Users } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/public/courses');
        setCourses(res.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <section id="courses" className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our <span className="text-gold-500">Courses</span>
          </h2>
          <p className="text-zinc-400">Klik setiap kursus untuk melihat detail dan instruktur</p>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" rows={3} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className="bg-zinc-900 border-zinc-800 overflow-hidden cursor-pointer group hover:border-gold-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`/${course.name.replace(/\s+/g, '')}1.jpg`} 
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/Jumbotron1.webp'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
                </div>
                
                <CardContent className="p-6 relative z-10 -mt-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{course.name}</h3>
                  <div className="h-px bg-zinc-800 w-full mb-4 group-hover:bg-gold-500/30 transition-colors" />
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.teachers.length > 0 ? (
                      course.teachers.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-zinc-800 rounded-full pr-3 pl-1 py-1 border border-zinc-700">
                          <img 
                            src={`/${t.name.split(' ')[0]}.webp`} 
                            alt={t.name}
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="text-xs text-zinc-300 font-medium">{t.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 bg-zinc-800 rounded-full px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs">
                        <Users size={12} />
                        <span>Coming Soon</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gold-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 flex items-center gap-2">
                    Detail Kursus &rarr;
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CourseModal 
        course={selectedCourse} 
        open={!!selectedCourse} 
        onOpenChange={(open) => !open && setSelectedCourse(null)} 
      />
    </section>
  );
}
