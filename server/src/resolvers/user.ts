import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Query, ObjectType, Resolver, Mutation, InputType, Field, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";

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
    @Query(() => User, {nullable: true})
    async me (
        @Ctx() { em, req }: MyContext
    ): Promise<User | null> {
        // not logged in
        if (!req.session.userId) {
            return null;
        }

        const user = await em.fork({}).findOne(User, {id: req.session.userId});
        return user;
    }

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
        let user;

        try {
             const result = await (em as EntityManager).fork({}).createQueryBuilder(User).getKnexQuery()
                .insert(
                    {
                        username: options.username, // currently case sensitive
                        password: hashedPassword,
                        // need underscores because that is name of column in db
                        // Knex does not know that mikro-orm adds them so we must add
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ).returning('*');
            user = result[0];
        } catch (err) {
            console.log(err.message);

            // duplicate username
            if (err.detail.includes("already exists")) {
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

        // save to cookie
        req.session.userId = user.id;

        return {user};
    }
}