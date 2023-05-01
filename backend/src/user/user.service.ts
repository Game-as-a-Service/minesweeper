import { Injectable } from '@nestjs/common';
import { User } from './user';

@Injectable()
export class UserService {
  private readonly userList: User[] = [];

  create(newUser: User) {
    if (
      newUser.account === undefined ||
      newUser.account === '' ||
      newUser.password === undefined ||
      newUser.password === ''
    ) {
      return 'input error';
    }

    for (const user of this.userList) {
      if (user.account === newUser.account) {
        return 'user exist';
      }
    }

    this.userList.push(newUser);

    return 'ok';
  }

  findAll(): User[] {
    return this.userList;
  }

  findOne(account: string): User | undefined {
    for (const user of this.userList) {
      if (user.account === account) {
        return user;
      }
    }

    return undefined;
  }
}
