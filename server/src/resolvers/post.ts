import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { DATASOURCE } from "../utils/initializeORM";
import { Vote } from "../entities/Vote";

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

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote (
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() {req}: MyContext
    ) {
        if (!(value === 1 || value === 0 || value === -1)) {
            return false;
        }
        const userId = req.session.userId;

        const vote = await Vote.findOne({where: {postId, userId}});
        if (vote) {
            if (vote.value !== value) {
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
        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        let cursorIndex = 3;
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
            cursorIndex = replacements.length;
        }

        // replacements indices start at 1 not 0 for sql
        const posts = await DATASOURCE.query(`
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

    // returns one post or null given id
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number
    ): Promise<Post | null> {
        return Post.findOne({where: {id: id}, relations: ["creator"]});
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
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string
    ): Promise<Post | null> {
        // first find post
        const post = Post.findOne({where: {id: id}});
        if (!post) {
            return null;
        }
        // then update
        if (typeof title !== undefined) {
            await Post.update({id}, {title});
        }
        return post;
    }

    // deletes an existing post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number
    ): Promise<Boolean> {
        try {
            await Post.delete(id);
        } catch (err) {
            console.error("Error: ", err.message);
            return false;
        }
        return true;
    }
}