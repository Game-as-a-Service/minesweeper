import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Dao } from './dao/dao';
import { MinesweeperData } from './data/minesweeper.data';
import MinesweeperDataModel from './data-model/minesweeper.data-model';
import { MinesweeperRepository } from './minesweeper-repository';
import MinesweeperPostgresqlDao from './dao/minesweeper-postgresql.dao';

@Injectable()
export class DataServices {
  minesweeperDao: Dao<MinesweeperData>;
  minesweeperDataModel: MinesweeperDataModel;
  minesweeperRepository: MinesweeperRepository;

  constructor(private prisma: PrismaService) {
    // this.minesweeperDao = new MinesweeperMemoryDao();
    this.minesweeperDao = new MinesweeperPostgresqlDao(prisma);
    this.minesweeperDataModel = new MinesweeperDataModel();
    this.minesweeperRepository = new MinesweeperRepository(
      this.minesweeperDao,
      this.minesweeperDataModel,
    );
  }
}
