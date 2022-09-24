import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { DataSource } from "typeorm";
import path from "path";

// importing DATASOURCE allows us to use querybuilder in resolvers
export const DATASOURCE = new DataSource({
    type: 'postgres',
    // forumdb2 created because of switch from mikroorm to typeorm
    database: 'forumdb2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    migrations: [path.join(__dirname, "../migrations/*")],
    // synchronize auto runs migrations, good for development
    synchronize: true,
    entities: [Post, User]
});
