import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BeatService } from './beat.service';
import { CreateBeatDto } from './dtos/createBeatDto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';
import { UpdateBeatDto } from './dtos/updateBeatDto';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100 MB

const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new BadRequestException('Sadece resim dosyaları yüklenebilir'),
      false,
    );
  }
  callback(null, true);
};

const audioFileFilter = (req, file, callback) => {
  if (file.mimetype !== 'audio/mpeg') {
    return callback(
      new BadRequestException('Sadece mp3 dosyaları yüklenebilir'),
      false,
    );
  }
  callback(null, true);
};

const beatFileStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('beats')
export class BeatController {
  constructor(private readonly beatService: BeatService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PRODUCER')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'coverUrl', maxCount: 1 },
        { name: 'audioUrl', maxCount: 1 },
      ],
      {
        storage: beatFileStorage,
        limits: {
          fileSize: MAX_AUDIO_SIZE,
        },
        fileFilter: (req, file, callback) => {
          if (file.fieldname === 'coverUrl') {
            if (
              req.headers['content-length'] &&
              +req.headers['content-length'] > MAX_IMAGE_SIZE
            ) {
              return callback(
                new BadRequestException('Resim dosyası en fazla 8MB olabilir'),
                false,
              );
            }
            return imageFileFilter(req, file, callback);
          }

          if (file.fieldname === 'audioUrl') {
            return audioFileFilter(req, file, callback);
          }

          return callback(
            new BadRequestException('Geçersiz dosya alanı'),
            false,
          );
        },
      },
    ),
  )
  async create(
    @Request() req: any,
    @Body() createBeatDto: CreateBeatDto,
    @UploadedFiles()
    files: {
      coverUrl?: Express.Multer.File[];
      audioUrl?: Express.Multer.File[];
    },
  ) {
    const coverFile = files.coverUrl?.[0];
    const audioFile = files.audioUrl?.[0];
    const producerId = req.user.id;

    return this.beatService.create(
      createBeatDto,
      producerId,
      coverFile?.path,
      audioFile?.path,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PRODUCER')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.beatService.remove(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('PRODUCER')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'coverUrl', maxCount: 1 }], {
      storage: beatFileStorage,
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
      fileFilter: (req, file, callback) => imageFileFilter(req, file, callback),
    }),
  )
  async updateBeat(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeatDto,
    @Request() req,
    @UploadedFiles()
    files?: { coverUrl?: Express.Multer.File[] },
  ) {
    const coverFilePath = files?.coverUrl?.[0]?.path ?? null;

    return this.beatService.update(id, dto, req.user.id, coverFilePath);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    const userId = req.user?.id ?? null;
    return this.beatService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.id ?? null;
    return this.beatService.findOne(id, userId);
  }

  @Get('producer/:producerId')
  @UseGuards(AuthGuard('jwt'))
  findByProducer(
    @Param('producerId', ParseIntPipe) producerId: number,
    @Request() req,
  ) {
    const userId = req.user?.id ?? null;
    return this.beatService.findByProducer(producerId, userId);
  }
}
