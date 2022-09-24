import { Request, Response } from "express";
import { Session } from "express-session"
import Redis from "ioredis"

export type MyContext = {
    req: Request & { session: Session };
    res: Response;
    redis: Redis;
}

// This is to shut typescript up
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}