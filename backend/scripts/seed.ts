import { PrismaClient, ProjectStatus, ProjectType, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertRole(name: RoleName) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name, description: `${name} role` },
  });
}

async function upsertUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  phone: string;
  role: RoleName;
}) {
  const role = await upsertRole(params.role);
  const password = await bcrypt.hash(params.password, 10);

  const user = await prisma.user.upsert({
    where: { email: params.email },
    update: {
      password,
      firstName: params.firstName,
      lastName: params.lastName,
      preferredName: params.preferredName,
      phone: params.phone,
      isActive: true,
    },
    create: {
      email: params.email,
      password,
      firstName: params.firstName,
      lastName: params.lastName,
      preferredName: params.preferredName,
      phone: params.phone,
      isActive: true,
      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  return user;
}

async function main() {
  const student = await upsertUser({
    email: 'student@example.com',
    password: 'student123',
    firstName: 'Student',
    lastName: 'Example',
    preferredName: 'Student',
    phone: '555-0100',
    role: RoleName.STUDENT,
  });

  const supervisor = await upsertUser({
    email: 'supervisor@example.com',
    password: 'supervisor123',
    firstName: 'Supervisor',
    lastName: 'Example',
    preferredName: 'Supervisor',
    phone: '555-0101',
    role: RoleName.SUPERVISOR,
  });

  await upsertUser({
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'Example',
    preferredName: 'Admin',
    phone: '555-0102',
    role: RoleName.ADMIN,
  });

  const existingProject = await prisma.project.findFirst({
    where: { title: 'Project Alpha' },
  });

  if (!existingProject) {
    await prisma.project.create({
      data: {
        title: 'Project Alpha',
        description: 'A capstone project focused on a real-world problem.',
        status: ProjectStatus.ACTIVE,
        type: ProjectType.CAPSTONE,
        studentId: student.id,
        supervisorId: supervisor.id,
      },
    });
  }

  console.log('Database seeded successfully.');
  console.log('Demo accounts:');
  console.log('  student@example.com / student123');
  console.log('  supervisor@example.com / supervisor123');
  console.log('  admin@example.com / admin123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
