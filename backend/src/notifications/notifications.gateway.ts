import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type NotificationPayload = {
  id: string;
  recipientId: string;
  projectId?: string | null;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // client should send { userId } on connection or join explicitly via joinRoom()
  }

  handleDisconnect(client: Socket) {
    // no-op
  }

  joinUserRoom(client: Socket, userId: string) {
    client.join(`user:${userId}`);
  }

  emitNew(payload: NotificationPayload) {
    this.server.to(`user:${payload.recipientId}`).emit('notification:new', payload);
  }

  emitUpdated(payload: NotificationPayload) {
    this.server.to(`user:${payload.recipientId}`).emit('notification:updated', payload);
  }
}

