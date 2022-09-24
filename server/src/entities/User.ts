import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    // typeorm assumes type: "text" for string
    @Column({unique: true})
    username!: string;

    @Field()
    @Column({unique: true})
    email!: string;

    @Column()
    password!: string;
}