"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVoteLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Vote_1 = require("../entities/Vote");
const createVoteLoader = () => new dataloader_1.default(async (keys) => {
    const votes = await Vote_1.Vote.findBy(keys);
    const voteIdsToVote = {};
    votes.forEach(vote => {
        voteIdsToVote[`${vote.userId}|${vote.postId}`] = vote;
    });
    return keys.map((key) => voteIdsToVote[`${key.userId}|${key.postId}`]);
});
exports.createVoteLoader = createVoteLoader;
//# sourceMappingURL=createVoteLoader.js.map