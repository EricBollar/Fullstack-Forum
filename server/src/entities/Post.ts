import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    // Adding @Field exposes variable to schema
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
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;
}