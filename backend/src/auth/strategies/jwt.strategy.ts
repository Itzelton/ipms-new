import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../../common/types/authenticated-user.interface';

const supabaseJwksProvider = passportJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
});

function dualSecretProvider(
  request: any,
  rawJwtToken: string,
  done: (err: any, secret?: any) => void,
) {
  try {
    const headerB64 = rawJwtToken.split('.')[0];
    const pad = '='.repeat((4 - (headerB64.length % 4)) % 4);
    const header = JSON.parse(Buffer.from(headerB64 + pad, 'base64url').toString('utf8'));
    if (header.alg === 'HS256') {
      done(null, process.env.JWT_SECRET ?? 'dev-secret');
    } else {
      supabaseJwksProvider(request, rawJwtToken, done);
    }
  } catch (err) {
    done(err);
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: dualSecretProvider,
      algorithms: ['ES256', 'RS256', 'HS256'],
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const email = payload.email;
    if (!email) throw new UnauthorizedException('Invalid token: no email claim');

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        id: payload.sub,
        email: payload.email,
        firstName: null,
        lastName: null,
        preferredName: null,
        phone: null,
        isActive: false,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        roles: [],
        mustChangePassword: false,
      };
    }

    if (!user.isActive) throw new UnauthorizedException('Account is inactive');
    return this.usersService.sanitizeUser(user);
  }
}
