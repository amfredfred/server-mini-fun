import { Server, Socket } from 'socket.io';
import { getGradiatedPumtList, getPumpList } from '../common/api';

class PumpSocket {
    private io: Server;
    private intervalId: NodeJS.Timeout | null = null;
    private searchParams = new Map<string, { filter_listing: URLSearchParams, filter_migrated: URLSearchParams }>();
    private isBusy: boolean = false

    constructor(io: Server) {
        this.io = io;
        this.startInterval();
        this.io.on('connection', this.onConnection.bind(this));
    }

    private onConnection(socket: Socket) {
        socket.on('requestPumpList', async ({ filter_listing, filter_migrated }) => {
            this.searchParams.set(socket.id, { filter_listing, filter_migrated });
            await this.sendPumpList();
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            this.searchParams.delete(socket.id);
        });
    }

    private async sendPumpList() {
        try {
            this.isBusy = true
            for (const [socketId, { filter_listing, filter_migrated }] of this.searchParams.entries()) {
                console.log({ socketId, filter_listing, filter_migrated })
                const [pumpList, migratedPumpList] = await Promise.allSettled([
                    getPumpList(filter_listing),
                    getGradiatedPumtList(filter_migrated)
                ])
                const data = {}
                if (pumpList.status === 'fulfilled')
                    Object.assign(data, { pump: pumpList.value })
                if (migratedPumpList.status === 'fulfilled')
                    Object.assign(data, { migrated: migratedPumpList.value })
                this.io.to(socketId).emit('pumpList', data);
            }
        } catch (error) {
            console.log(`Error@PumpSocket -> sendPumpList: ${error}`);
        } finally {
            this.isBusy = false
        }
    }

    private startInterval() {
        this.intervalId = setInterval(async () => {
            console.log({ isBusy: this.isBusy })
            if (!this.isBusy)
                await this.sendPumpList();
        }, 5000); //5000 = 5seconds
    }

    public stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

export default PumpSocket;