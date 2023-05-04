import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard('basic'))
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('jwt')
  async jwt(@Body() data: { token: string }) {
    const token = data.token;
    // console.log(`token: ${JSON.stringify(token)}`);

    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });

    return payload;
  }
}
