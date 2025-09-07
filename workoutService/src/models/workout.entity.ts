import {
    PrimaryGeneratedColumn,
    Column,
    Entity,
    BaseEntity,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import {Tag} from "./tag.entity";


export type PostElement = {
    type: 'paragraph' | 'image' | 'video';
    paragraph?: string | null;
    image?: string | null;
    video?: string | null;
};


@Entity()
export class Workout extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;


    @Column('text')
    title!: string;

    @Column('simple-json')
    elements!: PostElement[];

    @ManyToMany(() => Tag, { cascade: false })
    @JoinTable()
    tags!: Tag[];

    @Column('integer')
    author_id!: number;
}
