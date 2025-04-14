import { Module } from '@nestjs/common';
import { CookieService } from './cookie.service';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [ConfigModule],
  providers: [CookieService, FileUploadService],
})
export class CommonModule {}
