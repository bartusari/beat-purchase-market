import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { BeatModule } from './beat/beat.module';
import { GenreModule } from './genre/genre.module';
import { AuthModule } from './auth/auth.module';
import { FavoritesModule } from './favorite/favorite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        options: {
          encrypt: false,
        },
      }),
    }),

    AuthModule,
    UserModule,
    BeatModule,
    GenreModule,
    FavoritesModule,
  ],
})
export class AppModule {}
