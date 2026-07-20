import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { InvitesController } from './invites.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectInviteRepository } from './repositories/project-invite.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { ProjectHealthService } from './project-health.service';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [NotificationsModule, AuditModule, UsersModule, ChannelsModule],
  controllers: [ProjectsController, InvitesController],
  providers: [ProjectsService, ProjectRepository, ProjectInviteRepository, ProjectHealthService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
