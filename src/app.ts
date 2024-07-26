import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupSockets } from './socket';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "HEAD"]
    }
});

setupSockets(io);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
