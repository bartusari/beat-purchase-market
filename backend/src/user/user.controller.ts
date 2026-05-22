import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/createUserDto';
import { UpdateUserDto } from './dtos/updateUserDto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dtos/changePasswordDto';

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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req) {
    const userId = req.user.id;
    return this.userService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/profile')
  getProducerProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProducerProfile(id);
  }

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: profileImageStorage,
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Body() userData: CreateUserDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    if (profileImage) {
      userData.profileImage = profileImage.path.replace(/\\/g, '/');
    }
    return this.userService.create(userData);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: profileImageStorage,
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateUserDto,
    @Request() req,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    if (!id) {
      throw new BadRequestException("Bu ID'ye sahip bir hesap bulunamadı!");
    }

    if (req.user.id !== id) {
      throw new ForbiddenException('Bu hesap üzerinde yetkiniz yok!');
    }

    if (profileImage) {
      updateData.profileImage = profileImage.path.replace(/\\/g, '/');
    }

    return this.userService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (!id) {
      throw new BadRequestException("Bu ID'ye sahip bir hesap bulunamadı!");
    }

    if (req.user.id !== id) {
      throw new ForbiddenException('Bu hesap üzerinde yetkiniz yok!');
    }

    return this.userService.remove(id);
  }
}
