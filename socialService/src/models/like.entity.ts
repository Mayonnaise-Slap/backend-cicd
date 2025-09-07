import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Like extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('integer')
    userId!: number;

    @Column('integer')
    workoutId!: number;
}