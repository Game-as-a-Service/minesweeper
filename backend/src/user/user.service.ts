import { Injectable } from '@nestjs/common';
import { User } from './user';
import { hash } from 'src/common/bcryptHelper';

@Injectable()
export class UserService {
  private readonly userList: User[] = [];

  async create(newUser: User) {
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

    newUser.password = await hash(newUser.password);

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
