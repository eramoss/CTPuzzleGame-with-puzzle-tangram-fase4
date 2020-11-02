import Program from '../program/Program';
import { DudeMove } from './DudeMove';


export class Branch {
  dudeMove: DudeMove;
  onCompleteBranch: () => void;
  program: Program;

  constructor(dudeMove: DudeMove, onCompleteBranch: () => void) {
    this.dudeMove = dudeMove;
    this.onCompleteBranch = onCompleteBranch;
  }
}
