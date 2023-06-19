import { Module } from '@nestjs/common';
import { UseCaseService } from './use-case.service';
import { DataServices } from '../data-services/data-services.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  providers: [UseCaseService, PrismaService, DataServices],
})
export class UseCaseModule {}
