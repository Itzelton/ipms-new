import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  async findAll(pagination: PaginationDto) {
    const users = await this.userRepository.findAll(pagination);
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string) {
    return this.userRepository.findOne(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.update(id, updateUserDto);
    return this.sanitizeUser(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.remove(id);
    return this.sanitizeUser(user);
  }

  sanitizeUser(user: any): AuthenticatedUser {
    return sanitizeUser(user);
  }
}
