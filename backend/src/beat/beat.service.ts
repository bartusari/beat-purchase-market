import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Beat } from './beat.entity';
import { CreateBeatDto } from './dtos/createBeatDto';
import { Genre } from '../genre/genre.entity';
import { User } from '../user/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateBeatDto } from './dtos/updateBeatDto';
import { UserService } from 'src/user/user.service';
import { Favorite } from 'src/favorite/favorite.entity';

@Injectable()
export class BeatService {
  constructor(
    @InjectRepository(Beat)
    private readonly beatRepository: Repository<Beat>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
  ) {}

  async create(
    createBeatDto: CreateBeatDto,
    producerId: number,
    coverUrl?: string,
    audioUrl?: string,
  ): Promise<any> {
    let { genreIds, ...rest } = createBeatDto;
    let parsedGenreIds: number[] = [];

    if (genreIds) {
      if (typeof genreIds === 'string') {
        parsedGenreIds = (genreIds as string)
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id));
      } else if (Array.isArray(genreIds)) {
        parsedGenreIds = genreIds.map((id) => Number(id));
      } else {
        parsedGenreIds = [Number(genreIds)];
      }
    }

    if (parsedGenreIds.length === 0) {
      throw new BadRequestException(
        "En az bir geçerli tür (genre) ID'si gönderilmelidir.",
      );
    }

    const genres = await this.genreRepository.findBy({
      id: In(parsedGenreIds),
    });

    const uniqueIds = [...new Set(parsedGenreIds)];
    if (!genres || genres.length !== uniqueIds.length) {
      throw new NotFoundException(
        `Bazı türler bulunamadı. Gönderilen: ${uniqueIds.join(', ')}, Bulunan: ${genres.map((g) => g.id).join(', ')}`,
      );
    }

    const producer = await this.userRepository.findOne({
      where: { id: producerId },
    });
    if (!producer) {
      throw new NotFoundException('Belirtilen Producer bulunamadı.');
    }

    const beat = this.beatRepository.create({
      ...rest,
      beatKey: createBeatDto.beatKey,
      genres,
      producer,
      coverUrl,
      audioUrl,
    });

    const savedBeat = await this.beatRepository.save(beat);

    return {
      id: savedBeat.id,
      title: savedBeat.title,
      bpm: savedBeat.bpm,
      beatKey: savedBeat.beatKey,
      producerId: savedBeat.producer.id,
      genres: savedBeat.genres.map((g) => g.id),
      price: savedBeat.price,
      releaseDate: savedBeat.releaseDate,
      coverUrl: savedBeat.coverUrl,
      audioUrl: savedBeat.audioUrl,
    };
  }

  async remove(beatId: number, requesterId: number): Promise<boolean> {
    const beat = await this.beatRepository.findOne({
      where: { id: beatId },
      relations: ['producer'],
    });

    if (!beat) throw new NotFoundException(`${beatId} ID'li beat bulunamadı`);

    if (beat.producer.id !== requesterId)
      throw new ForbiddenException('Bu beat üzerinde yetkiniz yok');

    try {
      if (beat.coverUrl) {
        const coverPath = path.join(process.cwd(), beat.coverUrl);
        if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }
      if (beat.audioUrl) {
        const audioPath = path.join(process.cwd(), beat.audioUrl);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      }

      await this.favoriteRepo.delete({ beat: { id: beatId } });
      await this.beatRepository.delete(beatId);

      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      throw new BadRequestException(`Beat silinirken hata oluştu: ${message}`);
    }
  }

  async update(
    id: number,
    dto: UpdateBeatDto,
    requesterId: number,
    newCoverPath?: string | null,
  ) {
    const beat = await this.beatRepository.findOne({
      where: { id },
      relations: ['producer', 'genres'],
    });

    if (!beat) throw new NotFoundException('Beat bulunamadı');
    if (beat.producer.id !== requesterId)
      throw new ForbiddenException('Yetkin yok');

    if (dto.title !== undefined) beat.title = dto.title;
    if (dto.bpm !== undefined) beat.bpm = dto.bpm;
    if (dto.beatKey !== undefined) beat.beatKey = dto.beatKey;
    if (dto.price !== undefined) beat.price = dto.price;

    if (newCoverPath) {
      if (
        beat.coverUrl &&
        fs.existsSync(path.join(process.cwd(), beat.coverUrl))
      ) {
        fs.unlinkSync(path.join(process.cwd(), beat.coverUrl));
      }
      beat.coverUrl = newCoverPath;
    }

    if (dto.genreIds !== undefined) {
      if (dto.genreIds.length === 0) {
        beat.genres = [];
      } else {
        const genres = await this.genreRepository.findBy({
          id: In(dto.genreIds),
        });

        if (genres.length !== dto.genreIds.length) {
          throw new BadRequestException('Bazı genre ID’leri geçersiz.');
        }

        beat.genres = genres;
      }
    }

    return await this.beatRepository.save(beat);
  }

  async findAll(userId?: number): Promise<any[]> {
    const beats = await this.beatRepository.find({
      relations: ['producer', 'genres'],
    });

    let favoriteIds: number[] = [];

    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: { user: { id: userId } },
        relations: ['beat'],
      });
      favoriteIds = favorites.map((f) => f.beat.id);
    }

    const enriched = await Promise.all(
      beats.map(async (beat) => {
        const favoriteCount = await this.favoriteRepo.count({
          where: { beat: { id: beat.id } },
        });

        return {
          id: beat.id,
          title: beat.title,
          bpm: beat.bpm,
          beatKey: beat.beatKey,
          producerId: beat.producer.id,
          producerUsername: beat.producer.username,
          genres: beat.genres.map((g) => g.id),
          price: beat.price,
          releaseDate: beat.releaseDate,
          coverUrl: beat.coverUrl,
          audioUrl: beat.audioUrl,
          favoriteCount,
          isFavorite: favoriteIds.includes(beat.id),
        };
      }),
    );

    return enriched;
  }

  async findOne(id: number, userId?: number): Promise<any> {
    const beat = await this.beatRepository.findOne({
      where: { id },
      relations: ['producer', 'genres'],
    });

    if (!beat) throw new NotFoundException(`${id} ID'li beat bulunamadı.`);

    const favoriteCount = await this.favoriteRepo.count({
      where: { beat: { id: beat.id } },
    });

    let isFavorite = false;

    if (userId) {
      const fav = await this.favoriteRepo.findOne({
        where: { user: { id: userId }, beat: { id: beat.id } },
      });
      isFavorite = !!fav;
    }

    return {
      id: beat.id,
      title: beat.title,
      bpm: beat.bpm,
      beatKey: beat.beatKey,
      producerId: beat.producer.id,
      producerUsername: beat.producer.username,
      genreIds: beat.genres.map((g) => g.id),
      price: beat.price,
      releaseDate: beat.releaseDate,
      coverUrl: beat.coverUrl,
      audioUrl: beat.audioUrl,
      favoriteCount,
      isFavorite,
    };
  }

  async findByProducer(producerId: number, userId?: number) {
    const producer = await this.userRepository.findOne({
      where: { id: producerId },
    });

    if (!producer) {
      throw new NotFoundException(`${producerId} ID'li producer bulunamadı.`);
    }

    const beats = await this.beatRepository.find({
      where: { producer: { id: producerId } },
      relations: ['genres'],
    });

    let favoriteIds: number[] = [];

    if (userId) {
      const favorites = await this.favoriteRepo.find({
        where: { user: { id: userId } },
        relations: ['beat'],
      });
      favoriteIds = favorites.map((f) => f.beat.id);
    }

    return Promise.all(
      beats.map(async (beat) => {
        const favoriteCount = await this.favoriteRepo.count({
          where: { beat: { id: beat.id } },
        });

        return {
          ...beat,
          genres: beat.genres, // UserService'in aradığı tüm ilişki nesnesi
          genreIds: beat.genres.map((g) => g.id), // DTO veya alternatif kullanımlar için ID listesi
          favoriteCount,
          isFavorite: favoriteIds.includes(beat.id),
        };
      }),
    );
  }
}
