import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  //en az 8 karakter, en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'Parola en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
    },
  )
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
