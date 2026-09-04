import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RootController } from './common/root.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { MilestonesModule } from './milestones/milestones.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';
import { StorageModule } from './storage/storage.module';
import { ChannelsModule } from './channels/channels.module';
import { MeetingsModule } from './meetings/meetings.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env.local', '.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    MilestonesModule,
    SubmissionsModule,
    DiscussionsModule,
    NotificationsModule,
    AnalyticsModule,
    ReportsModule,
    AuditModule,
    StorageModule,
    ChannelsModule,
    MeetingsModule,
    WebhooksModule,
  ],
  controllers: [RootController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
