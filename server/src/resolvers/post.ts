import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { DATASOURCE } from "../utils/initializeORM";
import { Vote } from "../entities/Vote";
import { User } from "src/entities/User";

@InputType()
class PostOptions {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ): String {
        return root.text.slice(0, 200);
    }

    @FieldResolver(() => User)
    creator(
        @Root() post: Post,
        @Ctx() {userLoader}: MyContext
    ) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, {nullable: true})
    @UseMiddleware(isAuth)
    async voteStatus(
        @Root() post: Post,
        @Ctx() {req, voteLoader}: MyContext
    ) {
        const vote = await voteLoader.load({postId: post.id, userId: req.session.userId as number})
        return (vote ? vote.value : null);
    }

    @Mutation(() => Boolean)
    async vote (
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() {req}: MyContext
    ) {
        if (!(value === 1 || value === 0 || value === -1)) {
            return false;
        }
        const userId = req.session.userId;

        if (!userId) {
            throw new Error("not authenticated");
        }

        const vote = await Vote.findOne({where: {postId, userId}});
        if (vote) {
            if (value === 0) {
                const prevValue = vote.value;
                await DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        delete from vote
                        where "postId" = $1 and "userId" = $2
                    `, [postId, userId])
                });
                await DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update post
                        set points = points - $1
                        where id = $2
                    `, [prevValue, postId])
                });
            } else if (vote.value !== value) {
                await DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update vote
                        set value = $1
                        where "postId" = $2 and "userId" = $3
                    `, [value, postId, userId])
                });
                await DATASOURCE.transaction(async (tm) => {
                    await tm.query(`
                        update post
                        set points = points + $1
                        where id = $2
                    `, [2 * value, postId])
                    // upvote -> downvote is really -2 to points and vice-versa
                });
            } else {
                return false;
            }
        } else {
            await DATASOURCE.transaction(async (tm) => {
                await tm.query(`
                    insert into vote("userId", "postId", value)
                    values ($1, $2, $3)
                `, [userId, postId, value])
                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2;
                `, [value, postId])
            });
        }
        return true;
    }

    // returns posts
    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        // cursor will be null on first call
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);

        const replacements: any[] = [realLimit + 1];
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        // replacements indices start at 1 not 0 for sql
        const posts = await DATASOURCE.query(`
            select p.*,
            from post p
            ${cursor ? `where p."createdAt" < $2` : ''}
            order by p."createdAt" DESC
            limit $1
        `, replacements);

        return { 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimit + 1
        };
    }

    // returns one post or null given id
    @Query(() => Post, { nullable: true })
    async post(
        @Arg('id', () => Int) id: number,
        @Ctx() {req}: MyContext
    ): Promise<Post | null> {
        // return Post.findOne({where: {id: id}});

        const replacements: any[] = [id]; 

        // replacements indices start at 1 not 0 for sql
        const post = await DATASOURCE.query(`
            select p.*,
            from post p
            where p.id = $1
            limit 1
        `, replacements);

        return post[0];
    }

    // creates a new post
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('options') options: PostOptions,
        @Ctx() {req}: MyContext
    ): Promise<Post> {
        if (options.text === "" || options.title === "") {
            throw new Error("Posts must have a title and text!");
        }
        return Post.create({
            ...options,
            creatorId: req.session.userId
        }).save();
    }

    // updates an existing post
    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() {req}: MyContext
    ): Promise<Post | null> {
        const result = await DATASOURCE.createQueryBuilder()
            .update(Post)
            .set({title: title, text: text})
            .where('id = :id and "creatorId" = :creatorId', {
                id: id, creatorId: req.session.userId
            })
            .returning('*')
            .execute();
        return result.raw[0];
    }

    // deletes an existing post
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() {req}: MyContext
    ): Promise<Boolean> {
        try {
            const post = await Post.findOne({where: {id: id}});
            if (post) {
                if (post.creatorId === req.session.userId) {
                    await Vote.delete({postId: post.id});
                    await Post.delete(post.id);
                    return true;
                }
            }
            return false;
        } catch (err) {
            console.error("Error: ", err.message);
            return false;
        }
    }
}