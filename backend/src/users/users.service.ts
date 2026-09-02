import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRepository } from './repositories/user.repository';
import { sanitizeUser } from '../common/utils/sanitize-user.util';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }

  async findAll(pagination: PaginationDto, role?: string) {
    const users = await this.userRepository.findAll(pagination, role as any);
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string) {
    return this.userRepository.findOne(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findSupervisors() {
    return this.userRepository.findAll({ limit: 100 }, 'SUPERVISOR');
  }

  async getDirectory() {
    const all = await this.userRepository.findAll({ limit: 500 });
    return all.map((u: any) => ({
      id: u.id,
      name: u.preferredName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
      email: u.email,
      role: (u.roles?.[0]?.role?.name ?? u.roles?.[0] ?? 'STUDENT') as string,
    }));
  }

  async findStudentsWithAdvisors() {
    return this.userRepository.findStudentsWithAdvisors();
  }

  async findStudentsBySupervisor(supervisorId: string) {
    return this.userRepository.findStudentsBySupervisor(supervisorId);
  }

  async assignSupervisor(studentId: string, supervisorId: string | null) {
    return this.userRepository.assignSupervisor(studentId, supervisorId);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.update(id, {
      ...(dto.name !== undefined ? { preferredName: dto.name } : {}),
    } as any);
    return this.sanitizeUser(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.remove(id);
    return this.sanitizeUser(user);
  }

  async setActive(id: string, isActive: boolean) {
    const user = await this.userRepository.update(id, { isActive });
    return this.sanitizeUser(user);
  }

  sanitizeUser(user: any): AuthenticatedUser {
    return sanitizeUser(user);
  }
}
