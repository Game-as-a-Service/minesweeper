import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() user: User): string {
    return this.userService.create(user);
  }

  @Get()
  findAll(): User[] {
    return this.userService.findAll();
  }
}
