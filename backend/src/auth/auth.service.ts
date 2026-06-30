import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // Called after Supabase Auth signup — creates the local user profile.
  // The email comes from the verified Supabase JWT (req.user), not the body.
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

  async getMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.usersService.sanitizeUser(user);
  }
}
