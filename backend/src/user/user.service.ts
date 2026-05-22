import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import path from 'path';
import fs from 'fs';
import { ChangePasswordDto } from './dtos/changePasswordDto';
import * as bcrypt from 'bcrypt';
import { BeatService } from 'src/beat/beat.service';

@Injectable()
export class UserService {
  dataSource: any;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => BeatService))
    private readonly beatService: BeatService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findUsername(id: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user.username;
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user)
      throw new NotFoundException(`${username} kullanıcısı bulunamadı!`);
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (!updateData.profileImage) {
      updateData.profileImage = user.profileImage;
    } else {
      if (user.profileImage) {
        const oldPath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı!');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Eski şifre yanlış!');
    }

    if (user.password === dto.newPassword) {
      throw new BadRequestException('Yeni şifre eski şifre ile aynı olamaz!');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepository.save(user);

    return { message: 'Şifre başarıyla güncellendi' };
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['beats'],
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.query(
        `DELETE FROM favorite WHERE userId = @0`,
        [id],
      );

      if (user.beats && user.beats.length > 0) {
        await queryRunner.manager.query(
          `DELETE FROM favorite WHERE beatId IN (SELECT id FROM beat WHERE producerId = @0)`,
          [id],
        );

        for (const beat of user.beats) {
          if (beat.coverUrl) {
            const p = path.join(process.cwd(), beat.coverUrl);
            if (fs.existsSync(p)) fs.unlinkSync(p);
          }
          if (beat.audioUrl) {
            const p = path.join(process.cwd(), beat.audioUrl);
            if (fs.existsSync(p)) fs.unlinkSync(p);
          }
        }

        await queryRunner.manager.query(
          `DELETE FROM beat WHERE producerId = @0`,
          [id],
        );
      }

      if (user.profileImage) {
        const imgPath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await queryRunner.manager.query(`DELETE FROM [user] WHERE id = @0`, [id]);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getProducerProfile(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user || user.role !== 'PRODUCER')
      throw new NotFoundException('Producer bulunamadı');

    const beats = await this.beatService.findByProducer(id);

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.profileImage ?? null,

      beats: beats.map((b) => ({
        id: b.id,
        title: b.title,
        price: b.price,
        coverUrl: b.coverUrl,
        audioUrl: b.audioUrl,
        genres: b.genres,
        releaseDate: b.releaseDate,
      })),
    };
  }
}
