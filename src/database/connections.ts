import 'reflect-metadata'; 
import { AppDataSource } from '../data-source';

class DBConnection {
    engine;
    constructor() { this.engine = AppDataSource; }
}

const dbConnection = new DBConnection();
const engine = dbConnection.engine;
const dataSource = AppDataSource

export { engine, dbConnection, dataSource }; 