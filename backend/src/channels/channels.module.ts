import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelRepository } from './repositories/channel.repository';
import { ChannelsGateway } from './channels.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelRepository, ChannelsGateway],
  exports: [ChannelsService],
})
export class ChannelsModule {}
