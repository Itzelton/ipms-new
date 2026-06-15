import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
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
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    joinUserRoom(client: Socket, userId: string): void;
    emitNew(payload: NotificationPayload): void;
    emitUpdated(payload: NotificationPayload): void;
}
export {};
