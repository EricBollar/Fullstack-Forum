import { Post } from "../entities/Post";
import { User } from "../entities/User";
import { DataSource } from "typeorm";
import path from "path";
import { Vote } from "../entities/Vote";
import { __prod__ } from "src/constants";
import "dotenv-safe/config";

// importing DATASOURCE allows us to use querybuilder in resolvers
export const DATASOURCE = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path.join(__dirname, "../migrations/*")],
    // synchronize auto runs migrations, good for development
    // synchronize: true
    entities: [Post, User, Vote]
});
