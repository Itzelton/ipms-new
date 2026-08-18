import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { MeetingRepository } from './repositories/meeting.repository';
import { PrismaModule } from '../common/prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AuditModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingRepository],
  exports: [MeetingsService],
})
export class MeetingsModule {}
