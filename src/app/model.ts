import * as _ from 'lodash';

export class Yahtzee {
    upperSection: UpperSection;
    lowerSection: LowerSection;

    constructor() {
        this.upperSection = new UpperSection();
        this.lowerSection = new LowerSection();
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
    yahtzeeBonus: {
        count: number;
        score?: number;
    };

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
        this.yahtzeeBonus = {
            count: 0
        }
    }
}

export interface Roll {
    title: string;
    howToScore: string;
    subTitle?: string;
    score?: number;
}

export interface Die {
    id: number;
    value?: number;
    saved: boolean;
}

export class Player {
    name: string;
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
    chance?: number;
    yahtzeeBonus: string[];

    constructor(name: string) {
        this.name = name;
        this.yahtzeeBonus = [];
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

    getNumberRollScore(roll: Roll) {
        return (this as any)[roll.title];
    }
}