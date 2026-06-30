import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Frontend calls supabase.auth.signUp first, then calls this to create
  // the local user profile. The Supabase JWT proves their identity.
  @UseGuards(JwtAuthGuard)
  @Post('register')
  register(@Body() registerDto: RegisterDto, @CurrentUser() user: AuthenticatedUser) {
    return this.authService.register(registerDto, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }
}
