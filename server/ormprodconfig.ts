import { DataSource } from "typeorm";

// importing DATASOURCE allows us to use querybuilder in resolvers
export const DATASOURCE = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: "postgres",
    database: 'forumdb-prod',
    entities: ['dist/entities/*.js'],
    migrations: ['dist/entities/*.js']
});
 