import { Post } from "../entities/Post";
import { Resolver, Query, Arg, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
    // returns all posts
    @Query(() => [Post])
    posts(): Promise<Post[]> {
        return Post.find();
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
    async createPost(
        @Arg('title') title: string
    ): Promise<Post> {
        return Post.create({title}).save();
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