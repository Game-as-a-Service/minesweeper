import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

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
  async create(@Body() user: User): Promise<string> {
    return await this.userService.create(user);
  }

  @Get()
  findAll(): User[] {
    return this.userService.findAll();
  }
}
