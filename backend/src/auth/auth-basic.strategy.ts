import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { compare } from 'src/common/bcryptHelper';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, username, password): Promise<boolean> => {
    const user = this.userService.findOne(username);

    if (user === undefined) {
      throw new UnauthorizedException();
    }

    const isPasswordMatching = await compare(password, user.password);

    if (user.account === username && isPasswordMatching) {
      return true;
    }

    throw new UnauthorizedException();
  };
}
