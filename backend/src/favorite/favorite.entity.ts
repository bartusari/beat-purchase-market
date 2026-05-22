import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Beat } from '../beat/beat.entity';

@Entity()
@Unique(['user', 'beat'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Beat, (beat) => beat.favorites)
  beat: Beat;

  @ManyToOne(() => User, (user) => user.favorites)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
