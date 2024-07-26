import { Server, Socket } from 'socket.io';
import { getGradiatedPumtList, getPumpList } from '../common/api';
import ScrapingService from '../services/scraping-service';

const defaultParams = {
    limit: '200',
    orderby: 'usd_market_cap',
    direction: 'desc',
    pump: 'true',
    usd_market_cap: '20'
};

class PumpSocket {
    private io: Server;
    private intervalId: NodeJS.Timeout | null = null;
    private searchParams = new Map<string, { listings: URLSearchParams, migrated: URLSearchParams }>();
    private isBusy: boolean = false

    constructor(io: Server) {
        this.io = io;
        this.startInterval();
        this.io.on('connection', this.onConnection.bind(this));
    }

    private onConnection(socket: Socket) {
        socket.on('requestPumpList', async ({ listings, migrated }) => {
            this.searchParams.set(socket.id, { listings, migrated });
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
            for (const [socketId, { listings, migrated }] of this.searchParams.entries()) {
                console.log({ socketId, listings, migrated })
                const [pumpList,] = await Promise.allSettled([
                    getPumpList(listings),
                    getGradiatedPumtList(migrated)
                ])

                const lists = {
                    graduated: pumpList
                }

                this.io.to(socketId).emit('pumpList', lists);
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
        }, 5000); // Sends updates every 5 seconds
    }

    public stopInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

export default PumpSocket;