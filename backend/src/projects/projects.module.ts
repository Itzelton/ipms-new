import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectRepository } from './repositories/project.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { ProjectHealthService } from './project-health.service';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository, ProjectHealthService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
