import { Controller, Get } from '@nestjs/common';
import { AllTracksService } from './tracks.service';

@Controller('tracks')
export class AllTracksController {
  constructor(private readonly allTracksService: AllTracksService) {}

  @Get()
  async getAllTracks() {
    return this.allTracksService.getAllTracks();
  }

  @Get('refresh')
  async refreshTracks() {
    return this.allTracksService.refreshTracks();
  }
}
