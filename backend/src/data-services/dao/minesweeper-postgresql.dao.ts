import { PrismaService } from 'src/common/services/prisma.service';
import { MinesweeperData } from '../data/minesweeper.data';
import { Dao } from './dao';
import { Prisma } from '@prisma/client';

export default class MinesweeperPostgresqlDao implements Dao<MinesweeperData> {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<MinesweeperData> {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    return game.data as unknown as MinesweeperData;
  }

  async save(data: MinesweeperData): Promise<void> {
    await this.prisma.game.upsert({
      where: { id: data.gameId },
      update: { data: data as unknown as Prisma.JsonObject },
      create: { id: data.gameId, data: data as unknown as Prisma.JsonObject },
    });
  }
}
