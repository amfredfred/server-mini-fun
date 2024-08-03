require("reflect-metadata")
import { DataSource } from "typeorm"

import {
    POSTGRESQL_DB,
    POSTGRESQL_CONNECTION_STRING,
} from './config';

export const AppDataSource = new DataSource({
    type: "postgres",
    ...POSTGRESQL_CONNECTION_STRING,
    synchronize: true,
    // logging: true,//
    entities: [`${__dirname}/database/entities/**/*.ts`],
    migrations: [`${__dirname}/database/migrations/**/*.ts`],
    subscribers: [`${__dirname}./database/subscriptions/**/*.ts`],
    migrationsTableName: (`${POSTGRESQL_DB}_migration_table`).trim(),
}) 