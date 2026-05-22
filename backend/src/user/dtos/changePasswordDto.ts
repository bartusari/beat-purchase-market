import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    {
      message:
        'Parola en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
    },
  )
  newPassword: string;
}
