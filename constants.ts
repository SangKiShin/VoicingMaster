
import { NoteName, ChordQuality, VoicingType } from './types';

// 이명동음을 포함한 17개 주요 루트 노트 정의
export const NOTE_NAMES: NoteName[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

export const LETTER_PITCHES: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const STRING_TUNING = [4, 11, 7, 2, 9, 4];

export interface IntervalSpec {
  semitones: number;
  degree: number;
}

export const CHORD_SPELLS: Record<ChordQuality, IntervalSpec[]> = {
  [ChordQuality.MAJOR]: [{semitones: 0, degree: 0}, {semitones: 4, degree: 2}, {semitones: 7, degree: 4}],
  [ChordQuality.MINOR]: [{semitones: 0, degree: 0}, {semitones: 3, degree: 2}, {semitones: 7, degree: 4}],
  [ChordQuality.AUGMENTED]: [{semitones: 0, degree: 0}, {semitones: 4, degree: 2}, {semitones: 8, degree: 4}],
  [ChordQuality.DIMINISHED]: [{semitones: 0, degree: 0}, {semitones: 3, degree: 2}, {semitones: 6, degree: 4}],
  [ChordQuality.MAJOR_7]: [{semitones: 0, degree: 0}, {semitones: 4, degree: 2}, {semitones: 7, degree: 4}, {semitones: 11, degree: 6}],
  [ChordQuality.MINOR_7]: [{semitones: 0, degree: 0}, {semitones: 3, degree: 2}, {semitones: 7, degree: 4}, {semitones: 10, degree: 6}],
  [ChordQuality.DOMINANT_7]: [{semitones: 0, degree: 0}, {semitones: 4, degree: 2}, {semitones: 7, degree: 4}, {semitones: 10, degree: 6}],
  [ChordQuality.HALF_DIMINISHED_7]: [{semitones: 0, degree: 0}, {semitones: 3, degree: 2}, {semitones: 6, degree: 4}, {semitones: 10, degree: 6}],
  [ChordQuality.DIMINISHED_7]: [{semitones: 0, degree: 0}, {semitones: 3, degree: 2}, {semitones: 6, degree: 4}, {semitones: 9, degree: 6}]
};

export const VOICING_STRING_SETS: Record<string, number[][]> = {
  [VoicingType.TRIAD]: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6]],
  [VoicingType.OPEN_TRIAD]: [
    [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]
  ],
  [VoicingType.DROP_2]: [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]],
  [VoicingType.DROP_3]: [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6]
  ]
};
