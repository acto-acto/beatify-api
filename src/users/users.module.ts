import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { FileUploadService } from 'src/common/file-upload.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UserController],
  providers: [UserService, FileUploadService, ConfigService],
})
export class UserModule {}
