import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Mutation, InputType, Field, Ctx, UseMiddleware, Int, FieldResolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { DATASOURCE } from "../utils/initializeORM";

@InputType()
class PostOptions {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ): String {
        return root.text.slice(0, 200);
    }

    // returns posts
    @Query(() => [Post])
    posts(
        @Arg("limit", () => Int) limit: number,
        // cursor will be null on first call
        @Arg("cursor", () => String, {nullable: true}) cursor: string | null
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit);
        const queryBuilder = DATASOURCE
            .getRepository(Post)
            .createQueryBuilder("p") // alias of what we want to call it
            .orderBy('"createdAt"', "DESC")
            // there is a .limit() but for some reason .take() is best for pagination
            // docs do not explicity say why...
            .take(realLimit);
        if (cursor) {
            queryBuilder.where('"createdAt" < :cursor', {cursor: new Date(parseInt(cursor))});
        }
        return queryBuilder.getMany();
    }

    // returns one post or null given id
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: number
    ): Promise<Post | null> {
        return Post.findOne({where: {id: id}});
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