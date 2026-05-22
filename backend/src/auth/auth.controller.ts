import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUserDto';
import { LoginUserDto } from './dtos/loginUserDto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

const profileImageStorage = diskStorage({
  destination: './uploads/profiles',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `user-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new BadRequestException('Sadece resim dosyaları yüklenebilir'),
      false,
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return callback(
      new BadRequestException('Resim dosyası en fazla 8MB olabilir'),
      false,
    );
  }

  callback(null, true);
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginUser: LoginUserDto) {
    const user = await this.authService.validateUser(loginUser);
    if (!user) throw new UnauthorizedException('Wrong username or password');

    return this.authService.login(user);
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: profileImageStorage,
      fileFilter: imageFileFilter,
    }),
  )
  async register(
    @Body(ValidationPipe) registerUser: RegisterUserDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    if (profileImage) {
      registerUser.profileImage = profileImage.path.replace(/\\/g, '/');
    }
    return this.authService.register(registerUser);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
