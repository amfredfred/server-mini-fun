import { Server, Socket } from 'socket.io';
import { getGradiatedPumtList, getPumpList } from '../common/api';

class PumpSocket {
    private io: Server;
    private intervalId: NodeJS.Timeout | null = null;
    private searchParams = new Map<string, { filter_listing: URLSearchParams, filter_migrated: URLSearchParams }>();
    private isBusy: boolean = false;

    constructor(io: Server) {
        this.io = io;
        this.startInterval();
        this.io.on('connection', this.onConnection.bind(this));
    }

    private onConnection(socket: Socket) {


        socket.on('requestPumpList', async ({ filter_listing, filter_migrated }) => {
            if (!this.searchParams.get(socket.id)) {
                this.searchParams.set(socket.id, { filter_listing, filter_migrated });
                await this.sendPumpList();
            }
        });

        socket.on('disconnect', () => {
            if (this.searchParams.get(socket.id))
                this.searchParams.delete(socket.id);
        });
    }

    private async sendPumpList() {
        try {
            this.isBusy = true;
            const socketEntries = Array.from(this.searchParams.entries());
            const promises = socketEntries.map(async ([socketId, { filter_listing, filter_migrated }]) => {
                const [pumpList, migratedPumpList] = await Promise.allSettled([
                    getPumpList(filter_listing),
                    getGradiatedPumtList(filter_migrated)
                ]);
                const data: any = {};
                if (pumpList.status === 'fulfilled') {
                    data.pump = pumpList.value;
                }
                if (migratedPumpList.status === 'fulfilled') {
                    data.migrated = migratedPumpList.value;
                }
                this.io.to(socketId).emit('pumpList', data);
            });
            await Promise.allSettled(promises);
        } catch (error) {
            console.log(`Error@PumpSocket -> sendPumpList: ${error}`);
        } finally {
            this.isBusy = false;
        }
    }

    private startInterval() {
        this.intervalId = setInterval(async () => {
            if (!this.isBusy) await this.sendPumpList();
        }, 5000);
    }

    public stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

export default PumpSocket;