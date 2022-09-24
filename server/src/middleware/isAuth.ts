import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql/dist/interfaces/Middleware";

export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    if (!context.req.session.userId) {
        throw new Error("Not authenticated. Please log in.");
    }

    return next();
}