import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllTracksModule } from './all-tracks/all-tracks.module';

@Module({
  imports: [AllTracksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
