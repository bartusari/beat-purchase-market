import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { BeatKey } from '../beat.entity';

export class UpdateBeatDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bpm?: number;

  @IsOptional()
  @IsEnum(BeatKey)
  beatKey?: BeatKey;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;

    // "1,2,3"
    if (typeof value === 'string') {
      if (value.trim() === '') return [];
      return value
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));
    }

    // ["1","2"]
    if (Array.isArray(value)) {
      return value.map(Number).filter((id) => !isNaN(id));
    }

    const num = Number(value);
    return isNaN(num) ? [] : [num];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds?: number[];

  @IsOptional()
  @IsString()
  coverUrl?: string;
}
