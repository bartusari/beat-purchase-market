import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeatService } from './beat.service';
import { BeatController } from './beat.controller';
import { Beat } from './beat.entity';
import { Genre } from '../genre/genre.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { Favorite } from 'src/favorite/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Beat, Genre, User, Favorite]),
    forwardRef(() => UserModule),
  ],
  controllers: [BeatController],
  providers: [BeatService],
  exports: [BeatService],
})
export class BeatModule {}
