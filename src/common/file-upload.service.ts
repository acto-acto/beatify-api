import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Multer } from 'multer';
import { Readable } from 'stream';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );

      const buffer = Buffer.from(file.buffer);
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string {
    const urlParts = url.split('/');
    const id = urlParts[urlParts.length - 1].split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    return `${folder}/${id}`;
  }
}
