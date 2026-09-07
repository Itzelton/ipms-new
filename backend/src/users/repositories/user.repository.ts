import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { randomUUID, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
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

function makeMailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    family: 4,
    auth: { user, pass },
  } as any); // cast needed because `family` is not in @types/nodemailer but is valid at runtime
}

async function sendInviteEmail(to: string, firstName: string | null | undefined, inviteLink: string) {
  const mailer = makeMailer();
  if (!mailer) { console.error('[invite] SMTP not configured — SMTP_USER/SMTP_PASS missing'); return; }
  const name = firstName || to;
  await mailer.sendMail({
    from: `"IPMS" <${process.env.SMTP_USER}>`,
    to,
    subject: 'You have been invited to IPMS',
    html: `
      <p>Hi ${name},</p>
      <p>You have been invited to the <strong>Integrated Project Management System (IPMS)</strong>.</p>
      <p>Click the link below to set your password and activate your account:</p>
      <p><a href="${inviteLink}" style="font-size:16px;font-weight:bold">Accept Invitation</a></p>
      <p>This link expires in 24 hours. If you did not expect this invitation, you can ignore this email.</p>
      <p>— The IPMS Team</p>
    `,
  });
}

// No hardcoded users — all data lives in the database
const mockUsers: any[] = [];

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
    if (this.useInMemoryData) {
      const tempPassword = data.password || randomBytes(16).toString('hex');
      const hashedPassword = bcrypt.hashSync(tempPassword, 10);
      const user = {
        id: randomUUID(), ...data, password: hashedPassword,
        isActive: true, createdAt: new Date(), updatedAt: new Date(),
        roles: [{ role: { name: data.role as RoleName } }],
        studentProfile: null, supervisorProfile: null,
      } as any;
      this.inMemoryUsers.push(user);
      return user;
    }

    // Reject if already an active (non-deleted) user
    const existingUser = await this.prisma.user.findFirst({ where: { email: data.email, deletedAt: null } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Reject if already a pending invite
    const existingInvite = await this.prisma.pendingInvite.findUnique({ where: { email: data.email } });
    if (existingInvite) {
      throw new ConflictException('An invite has already been sent to this email. Use Resend Invite to send another.');
    }

    // Send invite via generateLink (bypasses Supabase's own SMTP sender) then
    // email the link ourselves via Nodemailer.
    let invitedSupabaseId: string | undefined;
    if (this.supabaseAdmin) {
      const deletedUser = await this.prisma.user.findFirst({ where: { email: data.email } });
      if (deletedUser) {
        await this.supabaseAdmin.auth.admin.deleteUser(deletedUser.id).catch(() => {});
      }

      const frontendUrl = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
      const { data: linkData, error } = await this.supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: data.email,
        options: {
          data: { role: data.role, firstName: data.firstName, lastName: data.lastName },
          redirectTo: `${frontendUrl}/set-password`,
        },
      });
      if (error) {
        const detail = error.message || JSON.stringify(error);
        throw new BadRequestException(`Failed to generate invite link: ${detail}`);
      }
      invitedSupabaseId = linkData?.user?.id;
      const inviteLink = linkData?.properties?.action_link;
      if (inviteLink) {
        sendInviteEmail(data.email, data.firstName, inviteLink).catch((e) => console.error('[invite] email send failed:', e.message));
      }
    }

    // Save to pending — user is added to the real users list only after they set their password
    return this.prisma.pendingInvite.create({
      data: {
        email: data.email,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        role: data.role as string,
        supabaseId: invitedSupabaseId ?? null,
      },
    });
  }

  async findPendingInvites(role?: string) {
    return this.prisma.pendingInvite.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingInviteByEmail(email: string) {
    return this.prisma.pendingInvite.findUnique({ where: { email } });
  }

  async resendPendingInvite(id: string) {
    const invite = await this.prisma.pendingInvite.findUnique({ where: { id } });
    if (!invite) throw new BadRequestException('Pending invite not found');

    if (this.supabaseAdmin) {
      const frontendUrl = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
      const { data: linkData, error } = await this.supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: invite.email,
        options: {
          data: { role: invite.role, firstName: invite.firstName, lastName: invite.lastName },
          redirectTo: `${frontendUrl}/set-password`,
        },
      });
      if (error) {
        throw new BadRequestException(`Failed to resend invite: ${error.message || JSON.stringify(error)}`);
      }
      const inviteLink = linkData?.properties?.action_link;
      if (inviteLink) {
        sendInviteEmail(invite.email, invite.firstName, inviteLink).catch((e) => console.error('[resend] email send failed:', e.message));
      }
    }

    // Update createdAt so the "invited X ago" timestamp resets
    return this.prisma.pendingInvite.update({
      where: { id },
      data: { createdAt: new Date() },
    });
  }

  async deletePendingInvite(id: string) {
    const invite = await this.prisma.pendingInvite.findUnique({ where: { id } });
    if (!invite) return null;
    // Remove from Supabase so the invite link stops working
    if (this.supabaseAdmin && invite.supabaseId) {
      await this.supabaseAdmin.auth.admin.deleteUser(invite.supabaseId).catch(() => {});
    }
    return this.prisma.pendingInvite.delete({ where: { id } });
  }

  // Creates a User directly — used by auth registration flows (not the admin-invite flow).
  async createFromAuth(data: { email: string; password: string; preferredName?: string; role: string; supabaseId?: string }) {
    const hashedPassword = data.password
      ? bcrypt.hashSync(data.password, 10)
      : bcrypt.hashSync(randomBytes(16).toString('hex'), 10);
    const role = data.role as RoleName;

    return this.prisma.user.create({
      data: {
        ...(data.supabaseId ? { id: data.supabaseId } : {}),
        email: data.email,
        password: hashedPassword,
        ...(data.preferredName ? { preferredName: data.preferredName } : {}),
        isActive: true,
        mustChangePassword: false,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: role },
                create: { name: role },
              },
            },
          },
        },
      },
      include: userWithRolesInclude,
    });
  }

  async createUserFromPendingInvite(supabaseId: string, pendingInvite: { id: string; email: string; firstName: string | null; lastName: string | null; role: string }) {
    const tempPassword = randomBytes(16).toString('hex');
    const hashedPassword = bcrypt.hashSync(tempPassword, 10);
    const role = pendingInvite.role as RoleName;

    const user = await this.prisma.user.create({
      data: {
        id: supabaseId,
        email: pendingInvite.email,
        ...(pendingInvite.firstName ? { firstName: pendingInvite.firstName } : {}),
        ...(pendingInvite.lastName ? { lastName: pendingInvite.lastName } : {}),
        password: hashedPassword,
        mustChangePassword: true,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: role },
                create: { name: role },
              },
            },
          },
        },
        ...(role === RoleName.STUDENT && {
          studentProfile: {
            create: { enrollmentId: `IDX-${Date.now()}` },
          },
        }),
        ...(role === RoleName.SUPERVISOR && {
          supervisorProfile: {
            create: { office: null },
          },
        }),
      },
      include: userWithRolesInclude,
    });

    await this.prisma.pendingInvite.delete({ where: { id: pendingInvite.id } });

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

  async getStats() {
    const [students, supervisors, admins, pending] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, isActive: true, roles: { some: { role: { name: RoleName.STUDENT } } } } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true, roles: { some: { role: { name: RoleName.SUPERVISOR } } } } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true, roles: { some: { role: { name: RoleName.ADMIN } } } } }),
      this.prisma.pendingInvite.count(),
    ]);
    return { students, supervisors, admins, total: students + supervisors + admins, pending };
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
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: userWithRolesInclude,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    if (this.useInMemoryData) {
      const user = this.findInMemoryUserById(id);
      if (!user) return null;
      Object.assign(user, data, { updatedAt: new Date() });
      return user as any;
    }

    const { level, indexNumber, course, department, studentReferenceNumber, referenceNumber, isActive, role: _role, ...coreData } = data;

    // Update core user fields
    await this.prisma.user.update({
      where: { id },
      data: { ...coreData, ...(isActive !== undefined ? { isActive } : {}) },
      include: userWithRolesInclude,
    });

    // Update student profile fields if provided
    if (level !== undefined || indexNumber !== undefined || course !== undefined || department !== undefined || studentReferenceNumber !== undefined) {
      const profileUpdate: any = {};
      if (level !== undefined) profileUpdate.level = level;
      if (indexNumber !== undefined) profileUpdate.enrollmentId = indexNumber;
      if (course !== undefined) profileUpdate.course = course;
      if (department !== undefined) profileUpdate.department = department;
      if (studentReferenceNumber !== undefined) profileUpdate.referenceNumber = studentReferenceNumber;
      await this.prisma.studentProfile.upsert({
        where: { userId: id },
        create: { userId: id, enrollmentId: indexNumber || `IDX-${Date.now()}`, level: level || null, course: course || null, department: department || null, referenceNumber: studentReferenceNumber || null },
        update: profileUpdate,
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
    // Soft delete in DB first
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
      include: userWithRolesInclude,
    });
    // Also remove from Supabase so they cannot log in again
    if (this.supabaseAdmin) {
      await this.supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
    }
    return user;
  }
}
