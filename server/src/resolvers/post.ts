import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Resolver, Query, Ctx, Arg, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
    // returns all posts
    @Query(() => [Post])
    posts(
        @Ctx() {em}: MyContext
    ): Promise<Post[]> {
        return em.fork({}).find(Post, {});
    }

    // returns one post or null given id
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id') id: number,
        @Ctx() {em}: MyContext 
    ): Promise<Post | null> {
        return em.fork({}).findOne(Post, { id });
    }

    // creates a new post
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() {em}: MyContext 
    ): Promise<Post> {
        const post = em.fork({}).create(Post, {title})
        await em.fork({}).persistAndFlush(post)
        return post;
    }

    // updates an existing post
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string,
        @Ctx() {em}: MyContext 
    ): Promise<Post | null> {
        // first find post
        const post = await em.fork({}).findOne(Post, {id});
        if (!post) {
            return null;
        }
        // then update
        if (typeof title !== undefined) {
            post.title = title;
            await em.fork({}).persistAndFlush(post)
        }
        return post;
    }

    // deletes an existing post
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx() {em}: MyContext 
    ): Promise<Boolean> {
        try {
            await em.nativeDelete(Post, {id});
        } catch (err) {
            console.error("Error: ", err.message);
            return false;
        }
        return true;
    }
}