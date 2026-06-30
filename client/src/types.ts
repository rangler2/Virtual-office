export interface Player {
  id: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  inOfficeToday: boolean;
  inOfficeTomorrow: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  message: string;
  timestamp: number;
}

export type ViewMode = 'isometric' | 'firstPerson';

export interface JoinData {
  name: string;
  avatar: string;
}

export const AVATARS = [
  '🧑‍💻', '👩‍💻', '🧑‍🎨', '👨‍🔬', '👩‍🚀', '🦊', '🐱', '🐶',
  '🦄', '🐼', '🦁', '🐸', '🤖', '👻', '🎃', '⭐',
];
