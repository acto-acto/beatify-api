import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';

@Injectable()
export class AllTracksService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly apiURL = this.configService.get<string>('JAMENDO_API_URL');
  private readonly clientId =
    this.configService.get<string>('JAMENDO_CLIENT_ID');

  getAllTracks(): Observable<any> {
    return this.httpService
      .get(`${this.apiURL}?client_id=${this.clientId}&format=json&limit=100`)
      .pipe(map((response) => response.data.results));
  }
}
