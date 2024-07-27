import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupSockets } from './socket';
import cors from 'cors'

const corsOptions = {
    origin: ['*'],
    methods: ['GET', 'HEAD', 'POST'],
    allowedHeaders: ['Content-Type', 'x-t-id']
};

const app = express();
app.use(cors(corsOptions))
app.options('*', cors(corsOptions));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["*"],
        methods: ['GET', 'HEAD', 'POST']
    }
});

setupSockets(io);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(req.headers['user-agent']);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
