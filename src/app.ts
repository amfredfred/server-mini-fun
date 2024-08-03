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
        origin: "*",
        methods: ['GET', 'HEAD', 'POST']
    }
});

setupSockets(io);

app.get('/', (req, res) => {
    res.send(req.headers['user-agent']);
});

export default server