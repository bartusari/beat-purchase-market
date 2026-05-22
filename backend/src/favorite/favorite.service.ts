import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { User } from 'src/user/user.entity';
import { Beat } from 'src/beat/beat.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Beat)
    private beatRepo: Repository<Beat>,
  ) {}

  async addFavorite(userId: number, beatId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const beat = await this.beatRepo.findOne({ where: { id: beatId } });

    if (!user || !beat) {
      throw new NotFoundException('User or beat not found');
    }

    const exists = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, beat: { id: beatId } },
    });

    if (exists) {
      throw new ConflictException('Already in favorites');
    }

    const fav = this.favoriteRepo.create({ user, beat });
    return this.favoriteRepo.save(fav);
  }

  async removeFavorite(userId: number, beatId: number) {
    const result = await this.favoriteRepo.delete({
      user: { id: userId },
      beat: { id: beatId },
    });

    if (!result.affected) {
      throw new NotFoundException('Favorite not found');
    }

    return { removed: true };
  }

  async getUserFavorites(userId: number) {
    return this.favoriteRepo.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        beat: { id: true },
      },
      relations: ['beat'],
    });
  }

  async toggleFavorite(userId: number, beatId: number) {
    const existing = await this.favoriteRepo.findOne({
      where: { user: { id: userId }, beat: { id: beatId } },
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { message: 'Removed from favorites', isFavorite: false };
    }

    const favorite = this.favoriteRepo.create({
      user: { id: userId },
      beat: { id: beatId },
    });

    await this.favoriteRepo.save(favorite);

    return { message: 'Added to favorites', isFavorite: true };
  }

  async getBeatFavoriteCount(beatId: number) {
    return this.favoriteRepo.count({
      where: { beat: { id: beatId } },
    });
  }
}
