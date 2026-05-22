import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { BeatKey } from '../beat.entity';

export class CreateBeatDto {
  @IsString()
  title: string;

  @Type(() => Number)
  @IsNumber()
  bpm: number;

  @IsEnum(BeatKey)
  beatKey: BeatKey;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
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
      return value.map((id) => Number(id)).filter((id) => !isNaN(id));
    }
    // Tek bir sayısal değer
    const num = Number(value);
    return isNaN(num) ? [] : [num];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  genreIds: number[];

  @IsOptional()
  @IsString()
  coverUrl?: string;

  audioUrl: any;
}
