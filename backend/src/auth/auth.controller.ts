import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RoleName } from '@prisma/client';

class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

class SetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

class LocalRegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEnum(RoleName)
  role!: RoleName;
}

class AdminRegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('directory')
  getDirectory() {
    return this.authService.getDirectory();
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.register(registerDto, user.email);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    // Try to load the full DB profile. If the user isn't in the DB yet
    // (brand-new Supabase registration), return the stub built from JWT claims —
    // the frontend will trigger /auth/register on the next step.
    try {
      return await this.authService.getMe(user.id, user.email);
    } catch {
      return user;
    }
  }

  @Public()
  @Post('local-login')
  localLogin(@Body() dto: LoginDto) {
    return this.authService.localLogin(dto.email, dto.password);
  }

  @Public()
  @Post('local-register')
  localRegister(@Body() dto: LocalRegisterDto) {
    return this.authService.localRegister(dto.email, dto.password, dto.name, dto.role);
  }

  @Public()
  @Post('register-admin')
  registerAdmin(@Body() dto: AdminRegisterDto) {
    return this.authService.registerAdmin(dto.email, dto.password, dto.name);
  }

  @Post('change-password')
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  @Post('set-password')
  setPassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetPasswordDto) {
    return this.authService.setPassword(user.id, dto.newPassword);
  }
}
