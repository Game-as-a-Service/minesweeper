import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Auth0Service } from './auth/auth0.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
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

  @Post('auth0-jwt')
  async getAuth0Jwt(@Request() req) {
    const token = req.headers.authorization.replace('Bearer ', '');

    return this.auth0Service.verifyToken(token);
  }
}
