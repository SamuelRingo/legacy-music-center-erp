import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testApi() {
  const staff = await prisma.user.findFirst({ where: { role: 'STAFF' } });
  if (!staff) {
    console.error("No staff user found");
    return;
  }
  const token = jwt.sign({ userId: staff.id, role: staff.role }, 'f94935f899427c41159eaec164c1487f0883ddd4e6010298c07a38f974d5da62c8bae3e0e2853e55f491960e40948c74156d38be5d616d1aab7eb31b3f850f55', { expiresIn: '1h' });

  const schedule = await prisma.schedule.findFirst();
  if (!schedule) {
    console.error("No schedule found");
    return;
  }
  
  console.log(`Testing GET /api/staff/schedules/${schedule.id}`);
  
  const res = await fetch(`http://localhost:3001/api/staff/schedules/${schedule.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
}
testApi().catch(console.error).finally(() => prisma.$disconnect());
