import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      preferredName: registerDto.name,
      role: registerDto.role,
    });

    const sanitizedUser = this.usersService.sanitizeUser(user);
    return this.buildAuthResponse(sanitizedUser);
  }

  async validateUser(email: string, password: string): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return null;
    }

    return this.usersService.sanitizeUser(user);
  }

  login(user: AuthenticatedUser) {
    return this.buildAuthResponse(user);
  }

  async getMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.usersService.sanitizeUser(user);
  }

  private buildAuthResponse(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
