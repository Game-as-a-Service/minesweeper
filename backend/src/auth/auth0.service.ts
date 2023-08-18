import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwksClient } from 'jwks-rsa';

const issuerUrl = 'https://dev-1l0ixjw8yohsluoi.us.auth0.com/';
const audienceUrl = 'https://api.gaas.waterballsa.tw';
const jwksUrl = `${issuerUrl}.well-known/jwks.json`;
@Injectable()
export class Auth0Service {
  constructor(private jwtService: JwtService) {}

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
}
