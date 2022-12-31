import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WsGateway } from './app.gateway';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
