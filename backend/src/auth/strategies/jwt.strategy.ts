import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.interface';

interface SupabaseJwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      }),
      algorithms: ['ES256', 'RS256'],
    });
  }

  async validate(payload: SupabaseJwtPayload): Promise<AuthenticatedUser> {
    if (!payload.email) {
      throw new UnauthorizedException('Invalid token: no email claim');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.usersService.sanitizeUser(user);
  }
}
