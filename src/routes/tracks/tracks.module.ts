import { Module } from '@nestjs/common';
import { AllTracksController } from './tracks.controller';
import { AllTracksService } from './tracks.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AllTracksController],
  providers: [AllTracksService],
})
export class AllTracksModule {}
