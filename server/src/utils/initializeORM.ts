import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { DataSource } from "typeorm";

export const DATASOURCE = new DataSource({
    type: 'postgres',
    // forumdb2 created because of switch from mikroorm to typeorm
    database: 'forumdb2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    // synchronize auto runs migrations, good for development
    synchronize: true,
    entities: [Post, User]
});
