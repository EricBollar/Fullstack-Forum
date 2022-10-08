"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATASOURCE = void 0;
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const Vote_1 = require("../entities/Vote");
require("dotenv-safe/config");
exports.DATASOURCE = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    migrations: [path_1.default.join(__dirname, "../migrations/*")],
    entities: [Post_1.Post, User_1.User, Vote_1.Vote]
});
//# sourceMappingURL=initializeORM.js.map