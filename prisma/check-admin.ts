// Quick script to check/reset admin user
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if admin exists
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@brix.com' }
  });

  if (admin) {
    console.log('Admin exists:', admin.email, '- Password:', admin.password);
  } else {
    console.log('Admin does NOT exist. Creating...');
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@brix.com',
        password: 'admin123',
        name: 'Administrator',
        role: 'admin'
      }
    });
    console.log('Created admin:', newAdmin.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
