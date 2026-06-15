import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
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
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;

    return this.prisma.user.findMany({
      skip,
      take,
      include: userWithRolesInclude,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: userWithRolesInclude,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userWithRolesInclude,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      include: userWithRolesInclude,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
      include: userWithRolesInclude,
    });
  }
}
