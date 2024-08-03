import { Client } from 'pg'
import { POSTGRESQL_CONNECTION_STRING } from '../config'
import { dataSource } from '../database/connections';
import server from '../app';

const PORT = process.env.PORT || 3000;

const createDatabase = async () => {
    const client = new Client(POSTGRESQL_CONNECTION_STRING);
    try {
        await client.connect();
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [POSTGRESQL_CONNECTION_STRING['database']]);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE ${POSTGRESQL_CONNECTION_STRING['database']}`);
            console.log('Database created successfully!');
        } else console.log('Database already exists.');
    } catch (err) {
        throw new Error(`Error creating database: ${err}`)
    } finally {
        await client.end();
    }
};
 
async function beginServing() {
    // return createDatabase().then(async () => {
    //     await dataSource.initialize()
        server.listen(PORT,);
        server.on('error', console.log);
        server.on('listening', () => console.log(`Serving Express On Port: ${PORT}`));
        return "All Good"
    // })
}

beginServing().then(console.log).catch(console.error);