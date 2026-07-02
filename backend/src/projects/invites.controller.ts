import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InvitesController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get(':token')
  getDetails(@Param('token') token: string) {
    return this.projectsService.getInviteDetails(token);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @CurrentUser('id') userId: string) {
    return this.projectsService.acceptInvite(token, userId);
  }
}
