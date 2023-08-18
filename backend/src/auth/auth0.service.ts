import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwksClient } from 'jwks-rsa';
import axios from 'axios';
import { UserService } from '../user/user.service';

const issuerUrl = 'https://dev-1l0ixjw8yohsluoi.us.auth0.com/';
const audienceUrl = 'https://api.gaas.waterballsa.tw';
const jwksUrl = `${issuerUrl}.well-known/jwks.json`;
@Injectable()
export class Auth0Service {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  jwksClient = new JwksClient({
    cache: true, // Default Value
    cacheMaxEntries: 5, // Default value
    cacheMaxAge: 600000, // Defaults to 10m
    jwksUri: jwksUrl,
  });

  async verifyToken(token: string) {
    const base64Header = token.split('.')[0];
    const headerBuffer = Buffer.from(base64Header, 'base64');
    const jwtHeader = JSON.parse(headerBuffer.toString());

    const kid = jwtHeader.kid;
    const key = await this.jwksClient.getSigningKey(kid);
    const signingKey = key.getPublicKey();

    return await this.jwtService.verifyAsync(token, {
      secret: signingKey,
      algorithms: ['RS256'],
      audience: audienceUrl,
      issuer: issuerUrl,
    });
  }

  async login(token: string) {
    // 先用 verifyToken 驗證 token 合法
    await this.verifyToken(token);
    // 然後去大平台詢問 user id
    const id = await this.queryUserId(token);
    const userAccount = `waterball-${id}`;
    // 最後登入自己的系統
    const users = await this.userService.users({
      where: { account: userAccount, isExternalProvider: true },
    });

    if (users.length === 0) {
      await this.userService.createUser({
        account: userAccount,
        password: '',
        isExternalProvider: true,
      });
    }

    const user = (
      await this.userService.users({
        where: { account: userAccount, isExternalProvider: true },
      })
    )[0];

    const payload = { id: user.id, account: user.account };
    const jwt = await this.jwtService.signAsync(payload);

    return { user, jwt };
  }

  async queryUserId(token: string) {
    // return '123456789';

    const hostUrl = 'https://api.gaas.waterballsa.tw/';

    const res = await axios({
      method: 'get',
      url: `${hostUrl}users/me`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = res.data as { id: string; email: string; nickname: string };
    return user.id;
  }
}
