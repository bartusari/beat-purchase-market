import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Beat } from '../beat/beat.entity';
import { Favorite } from 'src/favorite/favorite.entity';

export enum UserRole {
  USER = 'USER',
  PRODUCER = 'PRODUCER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  role: UserRole;

  @Column({ nullable: true })
  profileImage: string;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @OneToMany(() => Beat, (beat) => beat.producer)
  beats: Beat[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
