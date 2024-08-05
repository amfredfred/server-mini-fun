import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupSockets } from './socket';
import cors from 'cors';
import { fetchTokenDetails } from './common/api';

const corsOptions: cors.CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-t-id']
};

const app = express();
app.use(cors(corsOptions));

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/', (req: Request, res: Response) => {
    res.send(req.headers['user-agent']);
});

app.get('/fetch-token-details', asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const mint = req.query.mint as string | undefined;
    if (!mint) {
        res.status(400).json({ message: "Mint parameter is required", token_details: null });
        return;
    }
    const tokenDetails = await fetchTokenDetails(mint);
    console.log("ALL GOOD", tokenDetails, mint);
    res.json({ message: "Success", token_details: tokenDetails });
}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
});

setupSockets(io);

export default server;