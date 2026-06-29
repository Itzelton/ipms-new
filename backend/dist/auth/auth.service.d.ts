import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    validateUser(email: string, password: string): Promise<AuthenticatedUser | null>;
    login(user: AuthenticatedUser): {
        accessToken: string;
        user: AuthenticatedUser;
    };
    getMe(userId: string): Promise<AuthenticatedUser>;
    private buildAuthResponse;
}
