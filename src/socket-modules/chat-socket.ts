import { Server, Socket } from 'socket.io';

interface User {
    id: string;
    joinedAt: number;
}

class ChatSocket {
    private io: Server;
    private users: Map<string, User> = new Map();

    constructor(io: Server) {
        this.io = io;
        this.io.on('connection', this.onConnection.bind(this));
    }

    private onConnection(socket: Socket) {
        console.log(`User connected: ${socket.id}`);

        const user: User = {
            id: socket.id,
            joinedAt: Date.now()
        };
        this.users.set(socket.id, user);

        this.emitMessage({
            message: `User ${socket.id} has joined the chat.`,
            users: this.getAllOnlineUsers()
        });

        socket.on('sendMessage', (message: string) => {
            this.emitMessage({
                userId: socket.id,
                message,
                users: this.getAllOnlineUsers()
            });
            console.log(`User ${socket.id} sent message: ${message}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            this.users.delete(socket.id);
            this.emitMessage({
                message: `User ${socket.id} has disconnected.`,
                users: this.getAllOnlineUsers()
            });
        });
    }

    private getAllOnlineUsers() {
        return Array.from(this.users.values());
    }

    private emitMessage(data: { message?: string, userId?: string, users: User[] }) {
        this.io.emit('message', data);
    }
}

export default ChatSocket;