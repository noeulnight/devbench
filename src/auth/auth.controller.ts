import { Body, Controller, Get, Post, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Redirect()
  @Get('login')
  async login() {
    const url = await this.authService.getLoginUrl();
    return { url };
  }

  @Post('callback')
  async callback(@Body('code') code: string) {
    return this.authService.login(code);
  }
}
