import { User } from "../entities/User";
import { MyContext } from "src/types";
import { ObjectType, Resolver, Mutation, InputType, Field, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { Session } from "express-session"

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    // registers a new user
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        // check username length
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: "Username length must be greater than 2 characters."
                }]
            }
        }

        // check password length
        // may want to add better validation in future
        if (options.password.length <= 6) {
            return {
                errors: [{
                    field: 'password',
                    message: "Password length must be greater than 6 characters."
                }]
            }
        }

        // plain text password in db is bad!
        const hashedPassword = await argon2.hash(options.password);
        const user = em.fork({}).create(User, {
            username: options.username, // currently case sensitive
            password: hashedPassword
        });

        try {
            await em.fork({}).persistAndFlush(user);
        } catch (err) {
            console.log(err.message);

            // duplicate username
            if (err.code === "23505") {
                return {
                    errors: [{
                        field: "username",
                        message: "That Username is already in use!"
                    }]
                }
            }
        }

        return {user};
    }

    // attempts to login
    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.fork({}).findOne(User, { username: options.username });
        
        // does username exist
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "Incorrect Username/Password."
                }]
            }
        }

        // is password correct
        const valid = await argon2.verify(user.password, options.password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "Incorrect Username/Password."
                }]
            }
        }

        req.session.userId = user.id;
        console.log(req.session);

        return {user};
    }
}