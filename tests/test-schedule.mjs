import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const schedule = await prisma.schedule.findFirst({
    include: {
      course: true,
      teacher: { select: { id: true, name: true } },
      classroom: true,
      _count: {
        select: { enrollments: true }
      }
    }
  });
  console.log('Schedule query successful:', schedule !== null);
  
  if (schedule) {
    const students = await prisma.enrollment.findMany({
      where: { scheduleId: schedule.id },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        meetingAttendances: {
          orderBy: { meeting: { meetingDate: 'desc' } },
          take: 1
        },
        finalGrades: true
      }
    });
    console.log('Students query successful. Found:', students.length);

    const meetings = await prisma.meeting.findMany({
      where: { scheduleId: schedule.id },
      include: {
        _count: {
          select: { attendances: true }
        },
        attendances: {
          where: { status: 'HADIR' }
        }
      },
      orderBy: { meetingDate: 'desc' }
    });
    console.log('Meetings query successful. Found:', meetings.length);
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
