import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieService {
  constructor(private configService: ConfigService) {}

  private readonly cookieDomain =
    this.configService.get<string>('COOKIE_DOMAIN') ?? 'localhost';

  setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.cookieDomain,
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.cookieDomain,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
  }

  clearTokenCookies(res: Response): void {
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.cookieDomain,
      maxAge: 0,
      path: '/',
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: this.cookieDomain,
      maxAge: 0,
      path: '/auth/refresh',
    });
  }
}
