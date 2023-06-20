import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('basic'))
  @Get('authTest')
  authTest(): string {
    return this.appService.getHello();
  }

  @Post('jwt')
  async jwt(@Body() data: { token: string }) {
    const token = data.token;
    // console.log(`token: ${JSON.stringify(token)}`);

    const payload = await this.jwtService.verifyAsync(token);

    return payload;
  }
}
