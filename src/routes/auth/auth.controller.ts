import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  Get,
  Req,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CookieService } from 'src/common/cookie.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Response, Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Post('signup')
  async signup(
    @Body() requestPayload: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signup(requestPayload);

    this.cookieService.setTokenCookies(
      res,
      tokens.access_token,
      tokens.refresh_token,
    );

    return { message: 'Account Successfully Created' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() requestPayload: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(requestPayload);

    this.cookieService.setTokenCookies(
      res,
      tokens.access_token,
      tokens.refresh_token,
    );

    return { message: 'Account Successfully Logged In' };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    this.authService.invalidateTokens(req.user.userId);
    this.cookieService.clearTokenCookies(res);

    return { message: 'Logged Out Successfully' };
  }

  @Get('refresh')
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    this.cookieService.setTokenCookies(
      res,
      tokens.access_token,
      tokens.refresh_token,
    );

    return { message: 'Tokens Refreshed Successfully' };
  }

  @Post('forgot-password')
  forgotPassword(@Body() requestPayload: ForgotPasswordDto) {
    return this.authService.forgotPassword(requestPayload);
  }

  @Post('verify-otp')
  verifyOtp(@Body() requestPayload: VerifyOtpDto) {
    return this.authService.verifyOtp(requestPayload);
  }

  @Post('reset-password')
  resetPassword(@Body() requestPayload: ResetPasswordDto) {
    return this.authService.resetPassword(requestPayload);
  }
}
