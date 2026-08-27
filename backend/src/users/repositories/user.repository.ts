import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

const userWithRolesInclude = {
  roles: {
    include: {
      role: true,
    },
  },
  studentProfile: true,
} as const;

const mockUsers = [
  {
    id: randomUUID(),
    email: 'student@example.com',
    password: bcrypt.hashSync('student123', 10),
    firstName: 'Student',
    lastName: 'Example',
    preferredName: 'Student',
    phone: '555-0100',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: RoleName.STUDENT } }],
    studentProfile: null,
  },
  {
    id: randomUUID(),
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    firstName: 'Admin',
    lastName: 'Example',
    preferredName: 'Admin',
    phone: '555-0102',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: RoleName.ADMIN } }],
    studentProfile: null,
  },
  // The 9 real supervisors
  ...[
    { name: 'Frimpong Twum', first: 'Frimpong', last: 'Twum', email: 'frimpong.twum@ipms.edu' },
    { name: 'Agyeman', first: 'Agyeman', last: '', email: 'agyeman@ipms.edu' },
    { name: 'K.A Pabbi', first: 'K.A', last: 'Pabbi', email: 'ka.pabbi@ipms.edu' },
    { name: 'Benjamin Partey', first: 'Benjamin', last: 'Partey', email: 'benjamin.partey@ipms.edu' },
    { name: 'M Asante', first: 'M', last: 'Asante', email: 'm.asante@ipms.edu' },
    { name: 'Kwame Peasah', first: 'Kwame', last: 'Peasah', email: 'kwame.peasah@ipms.edu' },
    { name: 'Emmanuel Ahene', first: 'Emmanuel', last: 'Ahene', email: 'emmanuel.ahene@ipms.edu' },
    { name: 'Linda', first: 'Linda', last: '', email: 'linda@ipms.edu' },
    { name: 'Rosemary', first: 'Rosemary', last: '', email: 'rosemary@ipms.edu' },
  ].map(({ name, first, last, email }) => ({
    id: randomUUID(),
    email,
    password: bcrypt.hashSync('Supervisor@1234', 10),
    firstName: first,
    lastName: last || null,
    preferredName: name,
    phone: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: RoleName.SUPERVISOR } }],
    studentProfile: null,
  })),
];

@Injectable()
export class UserRepository {
  private get useInMemoryData() { return !this.prisma.isConnected; }
  private readonly inMemoryUsers = [...mockUsers];

  constructor(private readonly prisma: PrismaService) {}

  private findInMemoryUserByEmail(email: string) {
    return this.inMemoryUsers.find((user) => user.email === email);
  }

  private findInMemoryUserById(id: string) {
    return this.inMemoryUsers.find((user) => user.id === id);
  }

  async create(data: CreateUserDto) {
    const hashedPassword = data.password ? bcrypt.hashSync(data.password, 10) : '';

    if (this.useInMemoryData) {
      const user = {
        id: randomUUID(),
        ...data,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [{ role: { name: data.role as RoleName } }],
      } as any;

      this.inMemoryUsers.push(user);
      return user;
    }

    const { role, ...userData } = data;

    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: role as RoleName },
                create: { name: role as RoleName },
              },
            },
          },
        },
      },
      include: userWithRolesInclude,
    });
  }

  async findAll(pagination: PaginationDto, role?: RoleName) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      const filtered = role
        ? this.inMemoryUsers.filter((u) => u.roles.some((r) => r.role.name === role))
        : this.inMemoryUsers;
      return filtered.slice(skip, skip + take);
    }

    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;

    return this.prisma.user.findMany({
      skip,
      take,
      where: role
        ? { roles: { some: { role: { name: role } } } }
        : undefined,
      include: userWithRolesInclude,
    });
  }

  async findOne(id: string) {
    if (this.useInMemoryData) {
      return this.findInMemoryUserById(id) as any;
    }

    return this.prisma.user.findUnique({
      where: { id },
      include: userWithRolesInclude,
    });
  }

  async findByEmail(email: string) {
    if (this.useInMemoryData) {
      return this.findInMemoryUserByEmail(email) as any;
    }

    return this.prisma.user.findUnique({
      where: { email },
      include: userWithRolesInclude,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    if (this.useInMemoryData) {
      const user = this.findInMemoryUserById(id);
      if (!user) {
        return null;
      }
      Object.assign(user, data, { updatedAt: new Date() });
      return user as any;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: userWithRolesInclude,
    });
  }

  async findStudentsWithAdvisors() {
    if (this.useInMemoryData) {
      return this.inMemoryUsers
        .filter((u) => u.roles.some((r: any) => r.role.name === RoleName.STUDENT))
        .map((u) => ({ ...u, studentProfile: null }));
    }
    return this.prisma.user.findMany({
      where: { roles: { some: { role: { name: RoleName.STUDENT } } } },
      include: {
        ...userWithRolesInclude,
        studentProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignSupervisor(studentId: string, supervisorId: string | null) {
    if (this.useInMemoryData) {
      return { studentId, supervisorId };
    }
    const [profile] = await this.prisma.$transaction([
      this.prisma.studentProfile.upsert({
        where: { userId: studentId },
        create: {
          userId: studentId,
          enrollmentId: `STU-${Date.now()}`,
          advisorId: supervisorId,
        },
        update: { advisorId: supervisorId },
      }),
      this.prisma.project.updateMany({
        where: { studentId },
        data: { supervisorId },
      }),
    ]);
    return profile;
  }

  async remove(id: string) {
    if (this.useInMemoryData) {
      const index = this.inMemoryUsers.findIndex((user) => user.id === id);
      if (index === -1) {
        return null;
      }
      const [removed] = this.inMemoryUsers.splice(index, 1);
      return removed as any;
    }

    return this.prisma.user.delete({
      where: { id },
      include: userWithRolesInclude,
    });
  }
}
