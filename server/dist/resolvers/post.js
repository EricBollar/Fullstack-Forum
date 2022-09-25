"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const Post_1 = require("../entities/Post");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const initializeORM_1 = require("../utils/initializeORM");
const Vote_1 = require("../entities/Vote");
let PostOptions = class PostOptions {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostOptions.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostOptions.prototype, "text", void 0);
PostOptions = __decorate([
    (0, type_graphql_1.InputType)()
], PostOptions);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = class PostResolver {
    textSnippet(root) {
        return root.text.slice(0, 200);
    }
    async vote(value, postId, { req }) {
        if (!(value === 1 || value === 0 || value === -1)) {
            return false;
        }
        const userId = req.session.userId;
        if (!userId) {
            throw new Error("not authenticated");
        }
        const vote = await Vote_1.Vote.findOne({ where: { postId, userId } });
        if (vote) {
            if (value === 0) {
                const prevValue = vote.value;
                await initializeORM_1.DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        delete from vote
                        where "postId" = $1 and "userId" = $2
                    `, [postId, userId]);
                });
                await initializeORM_1.DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update post
                        set points = points - $1
                        where id = $2
                    `, [prevValue, postId]);
                });
            }
            else if (vote.value !== value) {
                await initializeORM_1.DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update vote
                        set value = $1
                        where "postId" = $2 and "userId" = $3
                    `, [value, postId, userId]);
                });
                await initializeORM_1.DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update post
                        set points = points + $1
                        where id = $2
                    `, [2 * value, postId]);
                });
            }
            else {
                return false;
            }
        }
        else {
            await initializeORM_1.DATASOURCE.transaction(async (tm) => {
                await tm.query(`
                    insert into vote("userId", "postId", value)
                    values ($1, $2, $3)
                `, [userId, postId, value]);
                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2;
                `, [value, postId]);
            });
        }
        return true;
    }
    async posts(limit, cursor, { req }) {
        const realLimit = Math.min(50, limit);
        const replacements = [realLimit + 1];
        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        let cursorIndex = 3;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIndex = replacements.length;
        }
        const posts = await initializeORM_1.DATASOURCE.query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email
                ) creator
            ${req.session.userId
            ? ',(select value from vote where "userId" = $2 and "postId" = p.id) "voteStatus"'
            : ',null as "voteStatus"'}
            from post p
            inner join "user" u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $${cursorIndex}` : ''}
            order by p."createdAt" DESC
            limit $1
        `, replacements);
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimit + 1
        };
    }
    async post(id, { req }) {
        const replacements = [id];
        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        const post = await initializeORM_1.DATASOURCE.query(`
            select p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email
                ) creator
            ${req.session.userId
            ? ',(select value from vote where "userId" = $2 and "postId" = $1) "voteStatus"'
            : ',null as "voteStatus"'}
            from post p
            inner join "user" u on u.id = p."creatorId"
            where p.id = $1
            limit 1
        `, replacements);
        return post[0];
    }
    async createPost(options, { req }) {
        if (options.text === "" || options.title === "") {
            throw new Error("Posts must have a title and text!");
        }
        return Post_1.Post.create(Object.assign(Object.assign({}, options), { creatorId: req.session.userId })).save();
    }
    async updatePost(id, title, text, { req }) {
        const result = await initializeORM_1.DATASOURCE.createQueryBuilder()
            .update(Post_1.Post)
            .set({ title: title, text: text })
            .where('id = :id and "creatorId" = :creatorId', {
            id: id, creatorId: req.session.userId
        })
            .returning('*')
            .execute();
        return result.raw[0];
    }
    async deletePost(id, { req }) {
        try {
            const post = await Post_1.Post.findOne({ where: { id: id } });
            if (post) {
                if (post.creatorId === req.session.userId) {
                    await Vote_1.Vote.delete({ postId: post.id });
                    await Post_1.Post.delete(post.id);
                    return true;
                }
            }
            return false;
        }
        catch (err) {
            console.error("Error: ", err.message);
            return false;
        }
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", String)
], PostResolver.prototype, "textSnippet", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)("value", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostOptions, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title')),
    __param(2, (0, type_graphql_1.Arg)('text')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map