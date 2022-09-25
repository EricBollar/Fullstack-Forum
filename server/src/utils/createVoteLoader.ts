import DataLoader from "dataloader";
import { In } from "typeorm";
import { Vote } from "../entities/Vote";

// takes array of {postId, userId} and returns array of votestatus: numbers | null
export const createVoteLoader = () =>  
    new DataLoader<{postId: number, userId: number}, Vote | null>(
    async keys => {
        const votes = await Vote.findBy(keys as any);
        const voteIdsToVote: Record<string, Vote> = {};
        votes.forEach(vote => {
            voteIdsToVote[`${vote.userId}|${vote.postId}`] = vote;
        })
        return keys.map((key) => voteIdsToVote[`${key.userId}|${key.postId}`])
});