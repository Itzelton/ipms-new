import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
import { IsOptional, IsString } from 'class-validator';

class AssignSupervisorDto {
  @IsOptional()
  @IsString()
  supervisorId?: string | null;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('supervisors')
  findSupervisors() {
    return this.usersService.findSupervisors();
  }

  @Roles('ADMIN')
  @Get('students')
  findStudentsWithAdvisors() {
    return this.usersService.findStudentsWithAdvisors();
  }

  @Roles('ADMIN')
  @Patch(':id/assign-supervisor')
  assignSupervisor(@Param('id') id: string, @Body() dto: AssignSupervisorDto) {
    return this.usersService.assignSupervisor(id, dto.supervisorId ?? null);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Query() pagination: PaginationDto, @Query('role') role?: string) {
    return this.usersService.findAll(pagination, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
