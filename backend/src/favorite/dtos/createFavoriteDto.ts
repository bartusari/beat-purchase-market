import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFavoriteDto {
  @Type(() => Number)
  @IsInt()
  beat: number;
}
