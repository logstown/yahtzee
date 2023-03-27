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
  dice: Die[] = [];
  players: Player[] = [new Player('Logan')];
  rolls: number = 0;
  possible: Player = new Player('possible');

  ngOnInit(): void {
    this._initDice();
  }

  roll(): void {
    this.dice.forEach(async x => {
      if (!x.saved) {
        x.value = undefined;
        await this._timeout(500)
        x.value = this._getRandomIntInclusive(1, 6);
        this._calcPossible();
      }
    });

    this.rolls++;
  }

  private _timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  saveDie(die: Die): void {
    die.saved = !die.saved;
  }

  acceptScore(player: Player, roll: Roll) {
    (player as any)[roll.title] = this.possible.getNumberRollScore(roll);

    if (this.rolls == 3) {
      this._initDice();
      this.rolls = 0;
      this.possible = new Player('possible')
    }
  }

  private _initDice() {
    this.dice = [];
    for (let i = 0; i < 5; i++) {
      this.dice.push({
        id: i,
        saved: false
      })
    }
  }

  private _getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  private _calcPossible(): void {
    this.possible = new Player('possible');

    this.yahtzee.upperSection.numberRolls.forEach(numberRoll => {
      (this.possible as any)[numberRoll.title] = _.sumBy(this.dice, die => {
        return die.value == numberRoll.score ? (die.value || 0) : 0;
      })
    });

    const totalDiceValue = _.sumBy(this.dice, x => (x.value || 0));
    console.log(_.countBy(this.dice, 'value'))
    const diceCounts = _.chain(this.dice).countBy('value').values().sortBy().value();

    console.log(diceCounts)

    if ((_.max(diceCounts) || 0) >= 3) {
      this.possible.threeOfAKind = totalDiceValue
    }
    if ((_.max(diceCounts) || 0) >= 4) {
      this.possible.fourOfAKind = totalDiceValue;
    }
    if ((_.max(diceCounts) || 0) >= 5) {
      this.possible.yahtzee = this.yahtzee.lowerSection.yahtzee.score;
    }
    if (_.isEqual(diceCounts, [2, 3])) {
      this.possible.fullHouse = this.yahtzee.lowerSection.fullHouse.score;
    }
    this.possible.chance = totalDiceValue;

    const diceArray = _.map(this.dice, 'value');
    const smStraights = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
    const lgStraights = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]];

    const gotASmStraight = smStraights.some(x => !_.difference(x, diceArray).length);
    const gotALgStraight = lgStraights.some(x => !_.difference(x, diceArray).length);

    if (gotASmStraight) {
      this.possible.smStraight = this.yahtzee.lowerSection.smStraight.score;
    }
    if (gotALgStraight) {
      this.possible.lgStraight = this.yahtzee.lowerSection.lgStraight.score;
    }
  }
}
