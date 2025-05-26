import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const whitelist = [
  'http://localhost:3000',
  'https://beatify-one.vercel.app',
  'https://beatify-5c2qk3r6d-actokuyts-projects.vercel.app/',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requires-auth'],
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
