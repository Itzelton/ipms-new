import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        user: AuthenticatedUser;
    }>;
    login(_loginDto: LoginDto, user: AuthenticatedUser): {
        accessToken: string;
        user: AuthenticatedUser;
    };
    me(user: AuthenticatedUser): Promise<AuthenticatedUser>;
}
