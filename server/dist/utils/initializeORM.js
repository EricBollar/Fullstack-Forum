"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATASOURCE = void 0;
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
exports.DATASOURCE = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'forumdb2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [Post_1.Post, User_1.User]
});
//# sourceMappingURL=initializeORM.js.map