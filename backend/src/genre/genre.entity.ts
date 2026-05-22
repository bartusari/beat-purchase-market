import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Beat } from '../beat/beat.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Beat, (beat) => beat.genres)
  beats: Beat[];
}
