import { Controller, Get } from '@nestjs/common';
import { AllTracksService } from './all-tracks.service';

@Controller('all-tracks')
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
