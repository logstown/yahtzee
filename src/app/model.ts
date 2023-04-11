import * as _ from 'lodash';

export class Yahtzee {
    upperSection: UpperSection;
    lowerSection: LowerSection;
    dice: Die[];
    possibleScores: Scores;
    rolls: number;
    isRolling: boolean;

    constructor() {
        this.upperSection = new UpperSection();
        this.lowerSection = new LowerSection();
        this.dice = [new Die(), new Die(), new Die(), new Die(), new Die()];
        this.possibleScores = new Scores();
        this.rolls = 0;
        this.isRolling = false;
    }

    initDice() {
        this.dice = [new Die(), new Die(), new Die(), new Die(), new Die()];
        this.possibleScores = new Scores();
        this.rolls = 0;
    }

    async rollDice(ms: number = 200) {
        this.isRolling = true;
        const promises = _.chain(this.dice)
            .reject('saved')
            .map((die, i) =>  die.roll(ms+(ms*i)))
            .value();

        await Promise.all(promises);
        this._calculatePossibleScores();
        this.rolls++;

        this.isRolling = false;
    }

    clearDiceSelection() {
        this.dice = _.map(this.dice, x => {
            x.saved = false;
            return x;
        })
    }

    private _calculatePossibleScores() {
        this.upperSection.numberRolls.forEach(numberRoll => {
            (this.possibleScores as any)[numberRoll.title] = _.sumBy(this.dice, die => {
                return die.value == numberRoll.score ? (die.value || 0) : 0;
            })
        });
    
        const totalDiceValue = _.sumBy(this.dice, x => (x.value || 0));
        const diceCounts = _.chain(this.dice).countBy('value').values().sortBy().value();
    
        this.possibleScores.threeOfAKind = 
        this.possibleScores.fourOfAKind = 
        this.possibleScores.yahtzee = 
        this.possibleScores.fullHouse = 
        this.possibleScores.chance =
        this.possibleScores.smStraight = 
        this.possibleScores.lgStraight = 0;
    
        if ((_.max(diceCounts) || 0) >= 3) {
            this.possibleScores.threeOfAKind = totalDiceValue
        }
        if ((_.max(diceCounts) || 0) >= 4) {
            this.possibleScores.fourOfAKind = totalDiceValue;
        }
        if ((_.max(diceCounts) || 0) >= 5) {
            this.possibleScores.yahtzee = this.lowerSection.yahtzee.score;
        }
        if (_.isEqual(diceCounts, [2, 3])) {
            this.possibleScores.fullHouse = this.lowerSection.fullHouse.score;
        }
        this.possibleScores.chance = totalDiceValue;
    
        const diceArray = _.map(this.dice, 'value');
        const smStraights = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
        const lgStraights = [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]];
    
        const gotASmStraight = smStraights.some(x => !_.difference(x, diceArray).length);
        const gotALgStraight = lgStraights.some(x => !_.difference(x, diceArray).length);
    
        if (gotASmStraight) {
            this.possibleScores.smStraight = this.lowerSection.smStraight.score;
        }
        if (gotALgStraight) {
            this.possibleScores.lgStraight = this.lowerSection.lgStraight.score;
        }
    }
}

export class UpperSection {
    numberRolls: Roll[];
    bonus: Roll;

    constructor() {
        const numberRollTitles = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes'];
        this.numberRolls = [];
        for(let i=0; i < 6; i++) {
            this.numberRolls.push({
                title: numberRollTitles[i],
                howToScore: `Count and add only ${numberRollTitles[i].toUpperCase()}`,
                score: i + 1
            })
        }

        this.bonus = {
            title: 'BONUS',
            subTitle: 'If total score is 63 or over',
            howToScore: 'Score 35',
            score: 35
        }
    }
}

export class LowerSection {
    threeOfAKind: Roll;
    fourOfAKind: Roll;
    fullHouse: Roll;
    smStraight: Roll;
    lgStraight: Roll;
    yahtzee: Roll;
    chance: Roll;

    constructor() {
        this.threeOfAKind = {
            title: '3 of a Kind',
            howToScore: 'Add total of all dice'
        };
        this.fourOfAKind = {
            title: '4 of a Kind',
            howToScore: 'Add total of all dice'
        };
        this.fullHouse = {
            title: 'Full House',
            howToScore: 'SCORE 25',
            score: 25
        };
        this.smStraight = {
            title: 'SM Straight',
            howToScore: 'SCORE 30',
            subTitle: 'Sequence of 4',
            score: 30
        };
        this.lgStraight = {
            title: 'LG Straight',
            howToScore: 'SCORE 40',
            subTitle: 'Sequence of 5',
            score: 40
        };
        this.yahtzee = {
            title: 'YAHTZEE',
            howToScore: 'SCORE 50',
            subTitle: '5 of a Kind',
            score: 50
        }
        this.chance = {
            title: 'Chance',
            howToScore: 'Score total of all dice'
        }
    }
}

export interface Roll {
    title: string;
    howToScore: string;
    subTitle?: string;
    score?: number;
}

export class Die {
    value?: number;
    saved: boolean;
    rotated: number;

    constructor() {
        this.saved = false;
        this.rotated = 0;
    }

    async roll(ms?: number) {
        var startTime = Date.now();
        while ((Date.now() - startTime) < (ms || 1000)) {
            this.value = Math.floor((Math.random() * 6) + 1);
            await new Promise(resolve => setTimeout(resolve, 75));
        }

        this.rotated = Math.floor(Math.random() *4) * 90;
    }

    toggleSave() {
        this.saved = !this.saved;
    }
}

export class Scores {
    aces?: number;
    twos?: number;
    threes?: number;
    fours?: number;
    fives?: number;
    sixes?: number;
    threeOfAKind?: number;
    fourOfAKind?: number;
    fullHouse?: number;
    smStraight?: number;
    lgStraight?: number;
    yahtzee?: number;
    yahtzeeBonus: string[];
    chance?: number;

    constructor() {
        this.yahtzeeBonus = []
    }

    get upperTotal() {
        return (this.aces || 0) + (this.twos || 0) + (this.threes || 0) + (this.fours || 0) + (this.fives || 0) + (this.sixes || 0)
    }

    get gotBonus() {
        return this.upperTotal >= 63;
    }

    get upperTotalWithBonus() {
        return this.gotBonus ? this.upperTotal + 35 : this.upperTotal;
    }

    get yahtzeeBonusScore() {
        return this.yahtzeeBonus.length * 100;
    }
    
    get lowerTotal() {
        return (this.threeOfAKind || 0) +
            (this.fourOfAKind || 0) +
            (this.fullHouse || 0) +
            (this.smStraight || 0) +
            (this.lgStraight || 0) +
            (this.yahtzee || 0) +
            (this.chance || 0) +
            this.yahtzeeBonusScore;
    }

    get grandTotal() {
        return this.upperTotalWithBonus + this.lowerTotal;
    }

    get isComplete(): boolean {
        return _.keys(this).length === 14;
    }

    getNumberRollScore(rollId: string) {
        return (this as any)[rollId];
    }
}

export class Player {
    name: string;
    scores: Scores;

    constructor(name: string) {
        this.name = name;
        this.scores = new Scores();
    }

    get isComplete() {
        return this.scores.isComplete;
    }
}