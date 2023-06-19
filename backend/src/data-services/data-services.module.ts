import { Module } from '@nestjs/common';
import { DataServices } from './data-services.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  providers: [DataServices, PrismaService],
})
export class DataServicesModule {}
