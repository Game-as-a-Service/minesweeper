import { Injectable } from '@nestjs/common';
import { ChordingUseCase } from './chordingUseCase';
import { FlagUseCase } from './flagUseCase';
import { OpenUseCase } from './openUseCase';
import { StartUseCase } from './startUseCase';
import { DataServices } from '../data-services/data-services.service';

@Injectable()
export class UseCaseService {
  startUseCase: StartUseCase;
  openUseCase: OpenUseCase;
  flagUseCase: FlagUseCase;
  chordingUseCase: ChordingUseCase;

  constructor(private dataServices: DataServices) {
    this.startUseCase = new StartUseCase(
      this.dataServices.minesweeperRepository,
    );
    this.openUseCase = new OpenUseCase(this.dataServices.minesweeperRepository);
    this.flagUseCase = new FlagUseCase(this.dataServices.minesweeperRepository);
    this.chordingUseCase = new ChordingUseCase(
      this.dataServices.minesweeperRepository,
    );
  }
}
