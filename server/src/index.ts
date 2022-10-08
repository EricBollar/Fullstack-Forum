import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis"
import connectRedis from "connect-redis"
import session from "express-session"
import { MyContext } from "./types";
import cors from "cors"
import { DATASOURCE } from "./utils/initializeORM";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";
import "dotenv-safe/config";

const main = async () => {
    await DATASOURCE.initialize();
    await DATASOURCE.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);

    const redis = new Redis(process.env.REDIS_URL);
    // do not need to await redis.connect();

    // necessary to have cookies on prod
    app.set("trust proxy", 1);

    // solves CORS issues
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true
        })
    );

    // UNCOMMENT FOR APOLLO STUDIO
    // This is needed to trick apollo studio into actually letting me use cookies...
    // app.set('trust proxy', process.env.NODE_ENV !== 'production')

    app.use(
        session({
            name: COOKIE_NAME, 
            store: new RedisStore({ 
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
                httpOnly: true,
                sameSite: "lax", // csrf
                secure: __prod__, // true -> only works in https
                domain: __prod__ ? ".fullstackforum.com" : undefined,
            },

            /* UNCOMMENT FOR APOLLO STUDIO
            // cookies in apollo studio...
            // https://community.apollographql.com/t/cookie-not-shown-stored-in-the-browser/1901/3
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
                httpOnly: true,
                // should use "lax" but only "none" works with apollo studio...
                sameSite: "none", // csrf
                // apollo studio is https while localhost is not! Wonderful design choice!
                // this SHOULD be __prod__
                secure: true // true -> only works in https
            },*/

            saveUninitialized: false,
            secret: process.env.SESSION_SECRET, // should hide this
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                PostResolver, 
                UserResolver
            ],
            validate: false
        }),

        // unique object that is accessible to all resolvers
        context: ({req, res}): MyContext => ({ 
            req, 
            res, 
            redis, 
            userLoader: createUserLoader(),
            voteLoader: createVoteLoader()
         })
    });
    await apolloServer.start();

    // UNCOMMENT FOR APOLLO STUDIO
    // Allows cookies on apollo studio
    // const cors = {
    //     credentials: true,
    //     origin: 'https://studio.apollographql.com'
    // }
    // apolloServer.applyMiddleware({ app, cors });

    // creates graphql endpoint on express
    // set cors to false on apollo because we have already
    // set it globally using cors package (see lines 33?-38?)
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen(parseInt(process.env.PORT), () => {
        console.log("Server started on port " + process.env.PORT);
    });
}

// run site
main().catch((err) => {
    console.error(err);
});