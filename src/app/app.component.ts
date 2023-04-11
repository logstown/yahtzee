import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Die, Player, Roll, Yahtzee } from './model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'yahtzee';
  yahtzee: Yahtzee = new Yahtzee();
  players: Player[] = [];
  playerToAddName: string = '';
  startedGame: boolean = false;
  
  private _activeIdx: number = 0;

  ngOnInit(): void {
  }

  get activePlayer(): Player | undefined {
    return this.players[this.activeIdx % this.players.length];
  }

  get activeIdx(): number {
    return this._activeIdx % this.players.length;
  }

  get isGameOver(): boolean | undefined {
    return _.last(this.players)?.isComplete;
  }

  get winner(): Player | undefined {
    return _.maxBy(this.players, x => x.scores.grandTotal)
  }

  addPlayer() {
    const playerToAdd = new Player(this.playerToAddName)
    this.players.push(playerToAdd);

    this.playerToAddName = '';
  }

  acceptScore(player: Player, rollId: string) {
    (player.scores as any)[rollId] = this.yahtzee.possibleScores.getNumberRollScore(rollId);

    this.yahtzee.initDice();
    this._activeIdx++;
  }

  getTransform(die: Die) {
    return {transform: `rotate(${die.rotated}deg)`}
  }
}
