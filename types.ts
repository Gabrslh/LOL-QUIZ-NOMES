export interface Champion {
    id: string;
    name: string;
    title: string;
    blurb?: string;
}

export interface GameState {
    guessedChampions: Set<string>; // Stores IDs of guessed champions
    gameStatus: 'menu' | 'playing' | 'finished';
    difficulty: 'normal' | 'hard';
    startTime: number | null;
    endTime: number | null;
    giveUp: boolean;
}

export enum Difficulty {
    NORMAL = 'normal',
    HARD = 'hard'
}