import { Module } from '@nestjs/common';
import { CookieService } from './cookie.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [CookieService],
})
export class CommonModule {}
