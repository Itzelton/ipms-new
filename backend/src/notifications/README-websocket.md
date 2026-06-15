# Notifications WebSocket

Socket namespace: `/notifications`

Events:
- `notification:new` payload: Notification (or NotificationPayload) emitted to room `user:{recipientId}`
- `notification:updated` payload: Notification (or NotificationPayload) emitted to room `user:{recipientId}`

Room joining:
- Client should call `joinUserRoom` with its `userId` (or implement in handleConnection).

