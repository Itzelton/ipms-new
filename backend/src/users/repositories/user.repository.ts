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
  },
  {
    id: randomUUID(),
    email: 'supervisor@example.com',
    password: bcrypt.hashSync('supervisor123', 10),
    firstName: 'Supervisor',
    lastName: 'Example',
    preferredName: 'Supervisor',
    phone: '555-0101',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: { name: RoleName.SUPERVISOR } }],
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
  },
];

@Injectable()
export class UserRepository {
  private readonly useInMemoryData = !process.env.DATABASE_URL;
  private readonly inMemoryUsers = [...mockUsers];

  constructor(private readonly prisma: PrismaService) {}

  private findInMemoryUserByEmail(email: string) {
    return this.inMemoryUsers.find((user) => user.email === email);
  }

  private findInMemoryUserById(id: string) {
    return this.inMemoryUsers.find((user) => user.id === id);
  }

  async create(data: CreateUserDto) {
    if (this.useInMemoryData) {
      const user = {
        id: randomUUID(),
        ...data,
        password: bcrypt.hashSync(data.password, 10),
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

  async findAll(pagination: PaginationDto) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      return this.inMemoryUsers.slice(skip, skip + take);
    }

    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;

    return this.prisma.user.findMany({
      skip,
      take,
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
