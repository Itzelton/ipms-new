import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

const userWithRolesInclude = {
  roles: { include: { role: true } },
  studentProfile: true,
  supervisorProfile: true,
} as const;

function makeSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Mock users for in-memory fallback
const mockUsers: any[] = [
  {
    id: randomUUID(),
    email: 'student@example.com',
    password: bcrypt.hashSync('student123', 10),
    firstName: 'Student', lastName: 'Example', preferredName: 'Student',
    phone: '555-0100', isActive: true, createdAt: new Date(), updatedAt: new Date(),
    roles: [{ role: { name: RoleName.STUDENT } }], studentProfile: null, supervisorProfile: null,
  },
  {
    id: randomUUID(),
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    firstName: 'Admin', lastName: 'Example', preferredName: 'Admin',
    phone: '555-0102', isActive: true, createdAt: new Date(), updatedAt: new Date(),
    roles: [{ role: { name: RoleName.ADMIN } }], studentProfile: null, supervisorProfile: null,
  },
];

@Injectable()
export class UserRepository {
  private get useInMemoryData() { return !this.prisma.isConnected; }
  private readonly inMemoryUsers = [...mockUsers];
  private readonly supabaseAdmin = makeSupabaseAdmin();

  constructor(private readonly prisma: PrismaService) {}

  private findInMemoryUserByEmail(email: string) {
    return this.inMemoryUsers.find((u) => u.email === email);
  }

  private findInMemoryUserById(id: string) {
    return this.inMemoryUsers.find((u) => u.id === id);
  }

  async create(data: CreateUserDto) {
    const tempPassword = data.password || randomBytes(16).toString('hex');
    const hashedPassword = bcrypt.hashSync(tempPassword, 10);

    if (this.useInMemoryData) {
      const user = {
        id: randomUUID(), ...data, password: hashedPassword,
        isActive: true, createdAt: new Date(), updatedAt: new Date(),
        roles: [{ role: { name: data.role as RoleName } }],
        studentProfile: null, supervisorProfile: null,
      } as any;
      this.inMemoryUsers.push(user);
      return user;
    }

    // Invite user via Supabase — sends them a password-setup link
    let supabaseId: string | undefined;
    if (this.supabaseAdmin) {
      const { data: inviteData, error } = await this.supabaseAdmin.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: { role: data.role, firstName: data.firstName, lastName: data.lastName },
          redirectTo: 'https://ipm-s.vercel.app/login',
        },
      );
      if (error) {
        // If user already exists in Supabase, continue — just create the DB record
        if (!error.message?.includes('already been registered') && !error.message?.includes('already exists')) {
          throw new BadRequestException(`Failed to invite user: ${error.message}`);
        }
      } else {
        supabaseId = inviteData?.user?.id;
      }
    }

    const { role, indexNumber, level, referenceNumber, password: _pw, ...userData } = data;

    const user = await this.prisma.user.create({
      data: {
        ...(supabaseId ? { id: supabaseId } : {}),
        ...userData,
        password: hashedPassword,
        mustChangePassword: true,
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
        ...(role === 'STUDENT' && {
          studentProfile: {
            create: {
              enrollmentId: indexNumber || `IDX-${Date.now()}`,
              level: level || null,
            },
          },
        }),
        ...(role === 'SUPERVISOR' && {
          supervisorProfile: {
            create: {
              office: referenceNumber || null,
            },
          },
        }),
      },
      include: userWithRolesInclude,
    });

    return user;
  }

  async createLocalAdmin(data: { email: string; password: string; preferredName: string }) {
    const hashed = bcrypt.hashSync(data.password, 10);
    if (this.useInMemoryData) {
      const user = {
        id: randomUUID(), email: data.email, password: hashed,
        preferredName: data.preferredName, isActive: false,
        createdAt: new Date(), updatedAt: new Date(),
        roles: [{ role: { name: RoleName.ADMIN } }], studentProfile: null, supervisorProfile: null,
      } as any;
      this.inMemoryUsers.push(user);
      return user;
    }
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        preferredName: data.preferredName,
        isActive: false,
        mustChangePassword: false,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: RoleName.ADMIN },
                create: { name: RoleName.ADMIN },
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
      const filtered = role ? this.inMemoryUsers.filter((u) => u.roles.some((r: any) => r.role.name === role)) : this.inMemoryUsers;
      return filtered.slice(skip, skip + take);
    }
    const take = pagination.limit || 50;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.user.findMany({
      skip, take,
      where: role
        ? { deletedAt: null, roles: { some: { role: { name: role } } } }
        : { deletedAt: null },
      include: userWithRolesInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    if (this.useInMemoryData) return this.findInMemoryUserById(id) as any;
    return this.prisma.user.findUnique({ where: { id }, include: userWithRolesInclude });
  }

  async findByEmail(email: string) {
    if (this.useInMemoryData) return this.findInMemoryUserByEmail(email) as any;
    return this.prisma.user.findUnique({ where: { email }, include: userWithRolesInclude });
  }

  async update(id: string, data: UpdateUserDto) {
    if (this.useInMemoryData) {
      const user = this.findInMemoryUserById(id);
      if (!user) return null;
      Object.assign(user, data, { updatedAt: new Date() });
      return user as any;
    }

    const { level, indexNumber, referenceNumber, isActive, ...coreData } = data;

    // Update core user fields
    await this.prisma.user.update({
      where: { id },
      data: { ...coreData, ...(isActive !== undefined ? { isActive } : {}) },
      include: userWithRolesInclude,
    });

    // Update student profile fields if provided
    if (level !== undefined || indexNumber !== undefined) {
      await this.prisma.studentProfile.upsert({
        where: { userId: id },
        create: { userId: id, enrollmentId: indexNumber || `IDX-${Date.now()}`, level: level || null },
        update: { ...(level !== undefined ? { level } : {}), ...(indexNumber !== undefined ? { enrollmentId: indexNumber } : {}) },
      });
    }

    // Update supervisor profile fields if provided
    if (referenceNumber !== undefined) {
      await this.prisma.supervisorProfile.upsert({
        where: { userId: id },
        create: { userId: id, office: referenceNumber },
        update: { office: referenceNumber },
      });
    }

    return this.prisma.user.findUnique({ where: { id }, include: userWithRolesInclude });
  }

  async findStudentsWithAdvisors() {
    if (this.useInMemoryData) {
      return this.inMemoryUsers.filter((u) => u.roles.some((r: any) => r.role.name === RoleName.STUDENT)).map((u) => ({ ...u, studentProfile: null }));
    }
    return this.prisma.user.findMany({
      where: { deletedAt: null, roles: { some: { role: { name: RoleName.STUDENT } } } },
      include: { ...userWithRolesInclude, studentProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStudentsBySupervisor(supervisorId: string) {
    if (this.useInMemoryData) return [];
    return this.prisma.user.findMany({
      where: { deletedAt: null, roles: { some: { role: { name: RoleName.STUDENT } } }, studentProfile: { advisorId: supervisorId } },
      include: { ...userWithRolesInclude, studentProfile: true, projects: { select: { id: true, title: true, status: true }, take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignSupervisor(studentId: string, supervisorId: string | null) {
    if (this.useInMemoryData) return { studentId, supervisorId };
    const [profile] = await this.prisma.$transaction([
      this.prisma.studentProfile.upsert({
        where: { userId: studentId },
        create: { userId: studentId, enrollmentId: `STU-${Date.now()}`, advisorId: supervisorId },
        update: { advisorId: supervisorId },
      }),
      this.prisma.project.updateMany({ where: { studentId }, data: { supervisorId } }),
    ]);
    return profile;
  }

  async remove(id: string) {
    if (this.useInMemoryData) {
      const index = this.inMemoryUsers.findIndex((u) => u.id === id);
      if (index === -1) return null;
      const [removed] = this.inMemoryUsers.splice(index, 1);
      return removed as any;
    }
    // Soft delete — set deletedAt and deactivate
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
      include: userWithRolesInclude,
    });
  }
}
