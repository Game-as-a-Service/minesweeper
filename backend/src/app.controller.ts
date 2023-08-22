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
import { UseCaseService } from './use-case/use-case.service';
import { Level } from './minesweeper/level';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
    private readonly auth0Service: Auth0Service,
    private readonly useCaseService: UseCaseService,
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
  async postAuth0Jwt(@Request() req) {
    const token = req.headers.authorization.replace('Bearer ', '');

    return this.auth0Service.verifyToken(token);
  }

  @Post('games')
  async postGames(@Request() req) {
    const token = req.headers.authorization.replace('Bearer ', '');
    // const payload = await this.auth0Service.verifyToken(token);

    // 第三方登入後，轉成本地驗證
    const { user } = await this.auth0Service.login(token);

    const gameId = await this.useCaseService.startUseCase.execute(
      user.id,
      Level.BEGINNER,
    );

    const hostUrl = 'https://minesweeper.snowbellstudio.com/';
    return `${hostUrl}games/${gameId}`;
  }
  @Get('health')
  async getHealth() {
    return `OK`;
  }
}
