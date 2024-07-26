import { Server, Socket } from "socket.io";

export interface IPumpCoin {
    addr: string;
    name: string;
    symbol: string;
}

export interface ISocketHandler {
    new(io: Server): any;
}
