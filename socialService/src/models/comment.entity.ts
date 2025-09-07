import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('integer')
    workoutId!: number;

    @Column('integer')
    userId!: number;

    @Column('text')
    commentText!: string;

}