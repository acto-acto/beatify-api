import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllTracksModule } from './routes/tracks/tracks.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './routes/users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './routes/auth/auth.module';
import { PlaylistsModule } from './routes/playlists/playlists.module';
import { SearchModule } from './routes/search/search.module';

@Module({
  imports: [
    AllTracksModule,
    PrismaModule,
    UserModule,
    AuthModule,
    CommonModule,
    PlaylistsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
