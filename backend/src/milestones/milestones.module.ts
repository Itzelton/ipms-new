import { Module } from '@nestjs/common';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { MilestoneRepository } from './repositories/milestone.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [MilestonesController],
  providers: [MilestonesService, MilestoneRepository],
  exports: [MilestonesService],
})
export class MilestonesModule {}
