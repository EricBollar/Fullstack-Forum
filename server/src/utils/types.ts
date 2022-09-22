import { Field, InputType } from "type-graphql";

@InputType()
export class UserLoginInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}