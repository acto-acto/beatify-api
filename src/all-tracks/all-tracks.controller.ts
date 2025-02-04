import { Controller, Get } from '@nestjs/common';
import { AllTracksService } from './all-tracks.service';
import { Observable } from 'rxjs';

@Controller('all-tracks')
export class AllTracksController {
  constructor(private readonly allTracksService: AllTracksService) {}

  @Get()
  getAllTracks(): Observable<any> {
    return this.allTracksService.getAllTracks();
  }
}
