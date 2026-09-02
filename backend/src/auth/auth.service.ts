import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
import { RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, authenticatedEmail: string) {
    const existing = await this.usersService.findByEmail(authenticatedEmail);
    if (existing) {
      throw new ConflictException('Profile already exists for this account');
    }

    const user = await this.usersService.create({
      email: authenticatedEmail,
      password: '',
      preferredName: registerDto.name,
      role: registerDto.role,
    });

    return this.usersService.sanitizeUser(user);
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) return null;
    const valid = await bcrypt.compare(password, (user.password as string) ?? '');
    if (!valid) return null;
    return this.usersService.sanitizeUser(user);
  }

  async getMe(userId: string, email?: string): Promise<AuthenticatedUser> {
    let user = await this.usersService.findOne(userId);
    if (!user && email) {
      // userId might be a Supabase UUID that doesn't match the local DB primary key —
      // fall back to email lookup which is always reliable.
      user = await this.usersService.findByEmail(email);
    }
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.usersService.sanitizeUser(user);
  }

  async localRegister(email: string, password: string, name: string, role: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      // User may have been created via Supabase (empty password) or with a plain-text
      // password (bug in older code). Either way, if it's not a valid bcrypt hash, reset it.
      const isValidHash = typeof existing.password === 'string' && existing.password.startsWith('$2');
      if (!isValidHash) {
        const hashed = await bcrypt.hash(password, 10);
        await this.usersService.update(existing.id, { password: hashed });
      }
      return this.localLogin(email, password);
    }

    const user = await this.usersService.create({
      email,
      password,
      preferredName: name,
      role: role as RoleName,
    });

    const sanitized = this.usersService.sanitizeUser(user);
    const access_token = this.jwtService.sign({ sub: sanitized.id, email: sanitized.email });
    const roles: string[] = Array.isArray(sanitized.roles) ? sanitized.roles as string[] : [];
    const resolvedRole =
      roles.includes('ADMIN') ? 'ADMIN' :
      roles.includes('SUPERVISOR') ? 'SUPERVISOR' :
      roles.includes('STUDENT') ? 'STUDENT' : null;

    return {
      access_token,
      user: {
        id: sanitized.id,
        email: sanitized.email,
        name: sanitized.preferredName || sanitized.firstName || sanitized.email,
        role: resolvedRole,
        mustChangePassword: sanitized.mustChangePassword ?? false,
      },
    };
  }

  async registerAdmin(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('An account with this email already exists');

    await this.usersService.createLocalAdmin({ email, password, preferredName: name });
    return { message: 'Registration submitted. An existing admin will review and activate your account.' };
  }

  async localLogin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const sanitized = this.usersService.sanitizeUser(user);
    const access_token = this.jwtService.sign({ sub: sanitized.id, email: sanitized.email });

    const roles: string[] = Array.isArray(sanitized.roles) ? sanitized.roles as string[] : [];
    const role =
      roles.includes('ADMIN') ? 'ADMIN' :
      roles.includes('SUPERVISOR') ? 'SUPERVISOR' :
      roles.includes('STUDENT') ? 'STUDENT' : null;

    return {
      access_token,
      user: {
        id: sanitized.id,
        email: sanitized.email,
        name: sanitized.preferredName || sanitized.firstName || sanitized.email,
        role,
        mustChangePassword: sanitized.mustChangePassword ?? false,
      },
    };
  }

  async getDirectory() {
    return this.usersService.getDirectory();
  }

  async setPassword(userId: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashed, mustChangePassword: false });
    return { message: 'Password updated successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashed, mustChangePassword: false });

    return { message: 'Password changed successfully' };
  }
}
