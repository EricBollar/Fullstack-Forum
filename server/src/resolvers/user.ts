import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Query, ObjectType, Resolver, Mutation, InputType, Field, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";
import { UserLoginInput } from "../utils/types";
import { validateRegister } from "../utils/validateRegister";

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
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {em} : MyContext,
    ) {
        // const user = await em.fork({}).findOne(User, {email});
        return true;
    }

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
        @Arg('options') options: UserLoginInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse> {
        const response = validateRegister(options);
        if (response) {
            return {errors: response} ;
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
                        email: options.email,

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
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.fork({}).findOne(
            User, 
            usernameOrEmail.includes("@") ? { email: usernameOrEmail }
            : { username: usernameOrEmail }
            );
        
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
        const valid = await argon2.verify(user.password, password);
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

    @Mutation(() => Boolean)
    async logout(
        @Ctx() {req, res}: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME); 
            
            if (err) {
                console.error("Error: ", err);
                resolve(false);
            }
            resolve(true);
        }))
    }
}