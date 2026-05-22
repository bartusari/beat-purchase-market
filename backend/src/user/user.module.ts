import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { BeatModule } from 'src/beat/beat.module';
import { Beat } from 'src/beat/beat.entity';
import { Favorite } from 'src/favorite/favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Beat, Favorite]),
    forwardRef(() => BeatModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
