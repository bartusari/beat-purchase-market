import { Controller, Get, Param } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Genre } from './genre.entity';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  async getAllGenres(): Promise<Genre[]> {
    return this.genreService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Genre | null> {
    return this.genreService.findOne(Number(id));
  }
}
