import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WsGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { PrismaService } from './common/services/prisma.service';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.local.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFile,
    }),
    UserModule,
    AuthModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, WsGateway, PrismaService],
})
export class AppModule {}
