import {
  IsString,
  IsEmail,
  IsEnum,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../user/user.entity';

export class RegisterUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
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
