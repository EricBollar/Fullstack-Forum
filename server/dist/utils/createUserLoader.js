"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const createUserLoader = () => new dataloader_1.default(async (ids) => {
    const users = await User_1.User.findBy({ id: (0, typeorm_1.In)(ids) });
    const userIdToUser = {};
    users.forEach(u => {
        userIdToUser[u.id] = u;
    });
    return ids.map((id) => userIdToUser[id]);
});
exports.createUserLoader = createUserLoader;
//# sourceMappingURL=createUserLoader.js.map