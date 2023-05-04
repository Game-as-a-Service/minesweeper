import { Controller, Request, Post, UseGuards } from '@nestjs/common';
// import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './auth-strategy/basic-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(BasicAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    // console.log(`user: ${JSON.stringify(req)}`);
    return this.authService.login(req.user);
  }
}
