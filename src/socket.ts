import { Server } from "socket.io";
import PumpSocket from "./socket-modules/pump-socket";
import ChatSocket from "./socket-modules/chat-socket";

export const setupSockets = (io: Server) => {
    const sockets = [PumpSocket, ChatSocket]
    sockets.map(socket => new socket(io))
}