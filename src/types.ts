export interface Character {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  theme?: string;
  createdAt?: number;
  excluded?: boolean;
}

export type ScreenMode = 'HOME' | 'LIBRARY' | 'GAME' | 'CHARACTER_IMPOSTOR' | 'BLIND_RANK' | 'QUESTION_IMPOSTOR' | 'BID';

export type GamePhase =
  | 'SECRET_SELECT_P1_PASS'
  | 'SECRET_SELECT_P1'
  | 'SECRET_SELECT_P2_PASS'
  | 'SECRET_SELECT_P2'
  | 'SECRET_REVEAL_P1_PASS'
  | 'SECRET_REVEAL_P1'
  | 'SECRET_REVEAL_P2_PASS'
  | 'SECRET_REVEAL_P2'
  | 'TURN_PASS'
  | 'PLAYING'
  | 'GAME_OVER';

export type Player = 'P1' | 'P2';

export interface PlayerState {
  secretCharacterId: string | null;
  eliminatedIds: string[];
}

export interface GameSession {
  characters: Character[]; // The 24 selected characters for this game
  p1: PlayerState;
  p2: PlayerState;
  currentTurn: Player;
  winner: Player | null;
  lastMessage: string | null;
}

export interface ImpostorSettings {
  players: string[];
  impostorCount: number;
}

export interface GuessWhoSettings {
  randomSecretCharacter: boolean;
  p1Name?: string;
  p1PopId?: string | null;
  p2Name?: string;
  p2PopId?: string | null;
}

export interface BidSettings {
  p1Name?: string;
  p1PopId?: string | null;
  p2Name?: string;
  p2PopId?: string | null;
}

export interface ImpostorPlayerRole {
  playerName: string;
  isImpostor: boolean;
}

export interface CharacterImpostorSession {
  secretCharacter: Character;
  players: ImpostorPlayerRole[];
  impostorNames: string[];
}

export interface BlindRankSession {
  queue: Character[];
}

export interface QuestionPair {
  id: string;
  question1: string;
  question2: string;
  question3: string;
  category?: string;
}

export interface QuestionImpostorPlayerAnswer {
  playerName: string;
  isImpostor: boolean;
  questionReceived: string;
  answer: string;
}

export interface QuestionImpostorSession {
  questionPair: QuestionPair;
  players: QuestionImpostorPlayerAnswer[];
  impostorNames: string[];
}
