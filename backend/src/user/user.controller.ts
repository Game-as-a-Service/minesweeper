import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { User } from '@prisma/client';
import { hash } from '../common/bcryptHelper';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // console.log(`req.user: ${JSON.stringify(req.user)}`);
    return req.user;
  }

  @Post()
  async create(@Body() user: User): Promise<User | string> {
    if (
      user.account === undefined ||
      user.account === '' ||
      user.password === undefined ||
      user.password === ''
    ) {
      return 'input error';
    }

    if ((await this.userService.user({ account: user.account })) !== null) {
      return 'user exist';
    }

    user.password = await hash(user.password);

    return await this.userService.createUser(user);
  }

  // @Get()
  // async findAll(): Promise<User[]> {
  //   return await this.userService.users({});
  // }
}
