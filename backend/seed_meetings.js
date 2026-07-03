import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find Teacher
  const teacher = await prisma.user.findFirst({ where: { email: 'teacher@legacymusik.sch.id' } });
  if (!teacher) throw new Error('Teacher not found');

  // Find Course
  const course = await prisma.course.findFirst({ where: { name: 'Piano Klasik Dasar' } });
  
  // Find Classroom
  const classroom = await prisma.classroom.findFirst();

  // Find Student
  const student = await prisma.studentProfile.findFirst();

  if (!course || !classroom || !student) throw new Error('Required data not found');

  // Create a schedule if not exists
  let schedule = await prisma.schedule.findFirst({
    where: { teacherId: teacher.id, courseId: course.id }
  });

  if (!schedule) {
    schedule = await prisma.schedule.create({
      data: {
        teacherId: teacher.id,
        courseId: course.id,
        classroomId: classroom.id,
        day: 'SENIN',
        startTime: '14:00',
        endTime: '15:00'
      }
    });
  }

  // Create enrollment
  let enrollment = await prisma.enrollment.findUnique({
    where: { studentId_scheduleId: { studentId: student.id, scheduleId: schedule.id } }
  });

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        scheduleId: schedule.id
      }
    });
  }

  // Create meetings
  for (let i = 1; i <= 3; i++) {
    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() - (7 * (3 - i))); // 3 weeks ago, 2 weeks ago, etc.

    const meeting = await prisma.meeting.create({
      data: {
        scheduleId: schedule.id,
        title: `Pertemuan ke-${i}`,
        meetingDate: meetingDate,
        journal: i === 3 ? null : `Jurnal latihan pertemuan ${i}`, // Leave last one empty for testing
        attendances: {
          create: {
            enrollmentId: enrollment.id,
            status: 'HADIR',
            note: 'Baik'
          }
        }
      }
    });
    console.log(`Created meeting: ${meeting.title}`);
  }

  console.log('Seeding meetings completed successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
