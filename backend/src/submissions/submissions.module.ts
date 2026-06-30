import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionRepository } from './repositories/submission.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { DiscussionsModule } from '../discussions/discussions.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [NotificationsModule, DiscussionsModule, AuditModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionRepository],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
