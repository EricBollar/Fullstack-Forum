import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

// takes array of userIds and returns array of Users
export const createUserLoader = () => new DataLoader<number, User>(async ids => {
    const users = await User.findBy({ id: In(ids as number[])});
    const userIdToUser: Record<number, User> = {};
    users.forEach(u => {
        userIdToUser[u.id] = u;
    })
    return ids.map((id) => userIdToUser[id]);
});