import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategy/basic.strategy';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Auth0Service } from './auth0.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [BasicStrategy, JwtStrategy, AuthService, Auth0Service],
  exports: [Auth0Service],
})
export class AuthModule {}
