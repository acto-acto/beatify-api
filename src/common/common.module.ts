import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { CookieService } from './cookie.service';
import { FileUploadService } from './file-upload.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host:
            config.get<string>('MAILTRAP_HOST') || 'sandbox.smtp.mailtrap.io',
          port: config.get<number>('MAILTRAP_PORT') || 587,
          auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
          },
        },
        defaults: {
          from: '"Beatify" <noreply@beatify.com>',
        },
      }),
    }),
  ],
  providers: [CookieService, FileUploadService, MailService],
  exports: [CookieService, FileUploadService, MailService],
})
export class CommonModule {}
