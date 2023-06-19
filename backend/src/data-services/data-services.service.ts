import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Dao } from './dao/dao';
import { MinesweeperData } from './data/minesweeper.data';
import MinesweeperDataModel from './data-model/minesweeper.data-model';
import { MinesweeperRepository } from './minesweeper-repository';
import MinesweeperPostgresqlDao from './dao/minesweeper-postgresql.dao';
import { ChordingUseCase } from '../use-case/chordingUseCase';
import { FlagUseCase } from '../use-case/flagUseCase';
import { OpenUseCase } from '../use-case/openUseCase';
import { StartUseCase } from '../use-case/startUseCase';

@Injectable()
export class DataServices {
  minesweeperDao: Dao<MinesweeperData>;
  minesweeperDataModel: MinesweeperDataModel;
  minesweeperRepository: MinesweeperRepository;

  // TODO Use Case 暫時放這邊
  startUseCase: StartUseCase;
  openUseCase: OpenUseCase;
  flagUseCase: FlagUseCase;
  chordingUseCase: ChordingUseCase;

  constructor(private prisma: PrismaService) {
    // this.minesweeperDao = new MinesweeperMemoryDao();
    this.minesweeperDao = new MinesweeperPostgresqlDao(prisma);
    this.minesweeperDataModel = new MinesweeperDataModel();
    this.minesweeperRepository = new MinesweeperRepository(
      this.minesweeperDao,
      this.minesweeperDataModel,
    );
    this.startUseCase = new StartUseCase(this.minesweeperRepository);
    this.openUseCase = new OpenUseCase(this.minesweeperRepository);
    this.flagUseCase = new FlagUseCase(this.minesweeperRepository);
    this.chordingUseCase = new ChordingUseCase(this.minesweeperRepository);
  }
}
