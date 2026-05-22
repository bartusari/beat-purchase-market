import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FavoritesService } from './favorite.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateFavoriteDto } from './dtos/createFavoriteDto';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Post('toggle')
  toggleFavorite(@Req() req, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.toggleFavorite(req.user.id, dto.beat);
  }

  @Post()
  addFavorite(@Req() req, @Body() dto: CreateFavoriteDto) {
    const user = req.user.id;
    return this.favoritesService.addFavorite(user, dto.beat);
  }

  @Delete()
  removeFavorite(@Req() req, @Body() dto: CreateFavoriteDto) {
    const user = req.user.id;
    return this.favoritesService.removeFavorite(user, dto.beat);
  }

  @Get('me')
  getMyFavorites(@Req() req) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Get('beat/:beatId/count')
  getBeatFavoriteCount(@Param('beatId') beatId: number) {
    return this.favoritesService.getBeatFavoriteCount(+beatId);
  }
}
