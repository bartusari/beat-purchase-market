import { IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
