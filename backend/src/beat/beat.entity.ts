import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Genre } from '../genre/genre.entity';
import { Favorite } from 'src/favorite/favorite.entity';

export enum BeatKey {
  C = 'C',
  Cm = 'Cm',
  D = 'D',
  Dm = 'Dm',
  E = 'E',
  Em = 'Em',
  F = 'F',
  Fm = 'Fm',
  G = 'G',
  Gm = 'Gm',
  A = 'A',
  Am = 'Am',
  B = 'B',
  Bm = 'Bm',
}

@Entity()
export class Beat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  bpm: number;

  @Column({
    type: 'varchar',
    length: 3,
    enum: BeatKey,
  })
  beatKey: BeatKey;

  @ManyToOne(() => User, (user) => user.beats, { onDelete: 'CASCADE' })
  producer: User;

  @ManyToMany(() => Genre, (genre) => genre.beats)
  @JoinTable()
  genres: Genre[];

  @Column()
  price: number;

  @Column({ type: 'datetime2', default: () => 'GETDATE()' })
  releaseDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverUrl: string | null;

  @Column({ type: 'varchar', length: 255 })
  audioUrl: string;

  @OneToMany(() => Favorite, (favorite) => favorite.beat, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  favorites: Favorite[];
}
