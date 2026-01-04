
export enum VoicingType {
  TRIAD = 'Triad',
  OPEN_TRIAD = 'Open Triad',
  DROP_2 = 'Drop 2',
  DROP_3 = 'Drop 3'
}

export enum ChordQuality {
  // Triad types
  MAJOR = 'Maj',
  MINOR = 'min',
  AUGMENTED = 'aug',
  DIMINISHED = 'dim',
  // 4-note (7th) types
  MAJOR_7 = 'Maj7',
  MINOR_7 = 'm7',
  DOMINANT_7 = '7',
  HALF_DIMINISHED_7 = 'm7b5',
  DIMINISHED_7 = 'dim7'
}

export type NoteName = string; 

export interface FretPosition {
  string: number; 
  fret: number;  
}

export interface GameState {
  currentKey: NoteName;
  rootNote: NoteName;
  quality: ChordQuality;
  voicingType: VoicingType;
  strings: number[]; 
  fixedRoot: FretPosition;
  fixedNoteName: string; 
  windowStartFret: number;
  selectedNotes: Record<number, number>; 
  chordNotes: string[]; 
  score: number;
  totalAttempts: number;
  isGameOver: boolean;
  feedback: 'correct' | 'wrong' | null;
}
