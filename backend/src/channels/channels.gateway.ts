import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from './channels.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  namespace: '/channels',
  cors: { origin: '*' },
})
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // userId → socketId mapping for typing debounce
  private typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly channelsService: ChannelsService) {}

  handleConnection(client: Socket) {
    // client identifies itself via handshake auth: { userId, channelIds[] }
    const { userId, channelIds } = client.handshake.auth ?? {};
    if (userId) client.data.userId = userId;
    if (Array.isArray(channelIds)) {
      for (const id of channelIds) client.join(`channel:${id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.typingTimers.forEach((timer, key) => {
      if (key.startsWith(`${client.data.userId}:`)) {
        clearTimeout(timer);
        this.typingTimers.delete(key);
      }
    });
  }

  // ── Client → Server ───────────────────────────────────────────────────────

  @SubscribeMessage('channel:join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string }) {
    client.join(`channel:${data.channelId}`);
    return { ok: true };
  }

  @SubscribeMessage('channel:leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string }) {
    client.leave(`channel:${data.channelId}`);
    return { ok: true };
  }

  @SubscribeMessage('message:send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string } & SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Not authenticated' };
    const message = await this.channelsService.sendMessage(data.channelId, userId, {
      content: data.content,
      parentId: data.parentId,
    });
    this.server.to(`channel:${data.channelId}`).emit('message:new', { channelId: data.channelId, message });
    return { ok: true, message };
  }

  @SubscribeMessage('message:react')
  async handleReact(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; messageId: string; emoji: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return { error: 'Not authenticated' };
    const reactions = await this.channelsService.toggleReaction(data.messageId, userId, data.emoji);
    this.server.to(`channel:${data.channelId}`).emit('reaction:updated', { messageId: data.messageId, reactions });
    return { ok: true };
  }

  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; userName: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    const timerKey = `${userId}:${data.channelId}`;

    // clear any existing stop timer
    const existing = this.typingTimers.get(timerKey);
    if (existing) clearTimeout(existing);

    // broadcast typing start to others in the channel
    client.to(`channel:${data.channelId}`).emit('typing:start', {
      channelId: data.channelId,
      userId,
      userName: data.userName,
    });

    // auto-stop after 3 s of silence
    const timer = setTimeout(() => {
      client.to(`channel:${data.channelId}`).emit('typing:stop', { channelId: data.channelId, userId });
      this.typingTimers.delete(timerKey);
    }, 3000);
    this.typingTimers.set(timerKey, timer);
  }

  @SubscribeMessage('message:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    await this.channelsService.markRead(data.channelId, userId);
  }

  // ── Server → Client helpers (called from REST handlers too) ───────────────

  emitNewMessage(channelId: string, message: any) {
    this.server.to(`channel:${channelId}`).emit('message:new', { channelId, message });
  }

  emitMessageEdited(channelId: string, message: any) {
    this.server.to(`channel:${channelId}`).emit('message:edited', { channelId, message });
  }

  emitMessageDeleted(channelId: string, messageId: string) {
    this.server.to(`channel:${channelId}`).emit('message:deleted', { channelId, messageId });
  }
}
