import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesService } from './favorite.service';
import { FavoritesController } from './favorite.controller';
import { Beat } from 'src/beat/beat.entity';
import { User } from 'src/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Beat])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [TypeOrmModule],
})
export class FavoritesModule {}
