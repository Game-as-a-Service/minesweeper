import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AppModule } from '@/app.module';
// import { helloWorld } from '../../lib/src/index';
import { helloWorld } from '@/lib/index';

async function bootstrap() {
  console.log(helloWorld());

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000);
}

void bootstrap();
