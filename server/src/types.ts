import { Request, Response } from "express";
import { Session } from "express-session"
import Redis from "ioredis"
import { createVoteLoader } from "./utils/createVoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
    req: Request & { session: Session };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
    voteLoader: ReturnType<typeof createVoteLoader>;
}

// This is to shut typescript up
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}