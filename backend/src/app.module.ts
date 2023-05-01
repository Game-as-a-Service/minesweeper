import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WsGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.local.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFile,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
