import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Query, ObjectType, Resolver, Mutation, Field, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UserLoginInput } from "../utils/types";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

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
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() {req, redis}: MyContext
    ): Promise<UserResponse> {
        // should do password validity checks here but i am lazy

        const key = FORGET_PASSWORD_PREFIX + token;

        const stringId = await redis.get(key);
        if (!stringId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Token invalid."
                    }
                ]
            }
        }

        const userId = parseInt(stringId);
        const user = await User.findOne({where: {id: userId}});

        // throw error if no user found.
        if (!user) {
            return {
                errors: [
                    {
                        field: "user",
                        message: "Token invalid."
                    }
                ]
            }
        }

        const newHashedPassword = await argon2.hash(newPassword);
        await User.update({id: userId}, {password: newHashedPassword});
        redis.del(key);

        // log in after password reset
        // this is not working??
        req.session.userId = user.id;

        return {user}
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis} : MyContext,
    ) {
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            // email is not in db
            return true; // don't want them to guess user's emails
        }


        const token = v4();
        const timeTillExpiration = 1000 * 60 * 60 * 24 // 24 hours
        await redis.set(
            FORGET_PASSWORD_PREFIX + token, 
            user.id, 
            "EX", // expiration call
            timeTillExpiration
            );

        await sendEmail(
            email, 
            `<a href="http://localhost:3000/change-password/${token}">Click Here to Reset Your Password</a>`
            );

        return true;
    }

    @Query(() => User, {nullable: true})
    async me (
        @Ctx() { req }: MyContext
    ): Promise<User | null> {
        // not logged in
        if (!req.session.userId) {
            return null;
        }

        return await User.findOne({where: {id: req.session.userId}});
    }

    // registers a new user
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UserLoginInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const response = validateRegister(options);
        if (response) {
            return {errors: response} ;
        }

        // plain text password in db is bad!
        const hashedPassword = await argon2.hash(options.password);
        let user;

        try {
            const result = await User.create({
                username: options.username,
                password: hashedPassword,
                email: options.email,
                // typeorm handles createdat and updatedat for us
            }).save();

            // below is a more in-depth way but generated sequel is the same
            // (used to be diff) but typeorm updated so the previous is just as viable
            // const result = await DATASOURCE.getRepository(User).createQueryBuilder().insert().into(User).values({
            //     username: options.username,
            //     password: hashedPassword,
            //     email: options.email,
            //     // typeorm handles createdat and updatedat for us
            // }).returning("*").execute();

            user = result;
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

        // recently created user is undefined... this should never run
        // it's mainly to suck off typescript
        if (!user) {
            return {
                errors: [{
                    field: "User",
                    message: "User not found. An Error occurred..."
                }]
            }
        }

        // login after successful register
        req.session.userId = user.id;

        return {user};
    }

    // attempts to login
    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes("@") 
            ? { where: { email: usernameOrEmail } }
            : { where: { username: usernameOrEmail} }
            );
        
        // does username exist
        if (!user) {
            return {
                errors: [{
                    field: "usernameOrEmail",
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