import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';

@Injectable()
export class GenreService {
  findById(id: number): Genre | PromiseLike<Genre> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,
  ) {}

  findAll() {
    return this.genreRepository.find({
      order: { name: 'ASC' },
    });
  }

  findOne(id: number) {
    const genre = this.genreRepository.findOne({ where: { id } });
    if (!genre) throw new NotFoundException(`Genre with ID ${id} not found`);
    return genre;
  }
}
