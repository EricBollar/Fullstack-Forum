import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import * as redis from 'redis';
import { appendFile } from "fs";
import { MyContext } from "./types";
import { NONAME } from "dns";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    // automatically run migrations
    await orm.getMigrator().up()

    const app = express();

    // for some reason this require call is necessary...
    const session = require('express-session')
    const RedisStore = require('connect-redis')(session)

    // without legacyMode: true, every damn value must be a string
    // whoever updated redis to be like this is a dumbass! 
    // https://github.com/redis/node-redis/issues/2116
    const redisClient = redis.createClient({ legacyMode: true })
    await redisClient.connect()

    // This is needed to trick apollo studio into actually letting me use cookies...
    app.set('trust proxy', process.env.NODE_ENV !== 'production')

    app.use(
        session({
            name: "qid", 
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
                httpOnly: true,
                // should use "lax"? but "none" works with apollo studio
                sameSite: "none", // csrf
                // apollo studio is https but localhost isnt! Wonderful design choice!
                // https://community.apollographql.com/t/cookie-not-shown-stored-in-the-browser/1901/3
                secure: true // true -> only works in https
            },
            saveUninitialized: false,
            secret: "secret", // should hide this
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                HelloResolver, 
                PostResolver, 
                UserResolver
            ],
            validate: false
        }),

        // unique object that is accessible to all resolvers
        context: ({req, res}): MyContext => ({em: orm.em , req, res})
    });
    await apolloServer.start();

    // Allows cookies on apollo studio
    const cors = {
        credentials: true,
        origin: 'https://studio.apollographql.com'
    }

    // creates graphql endpoint on express
    apolloServer.applyMiddleware({ app, cors });

    app.listen(4000, () => {
        console.log("Server started on localhost:4000...");
    });
}

// run site
main().catch((err) => {
    console.error(err);
});