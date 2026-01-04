
import { NOTE_NAMES, STRING_TUNING, CHORD_SPELLS, VOICING_STRING_SETS, MAJOR_SCALES, LETTERS, LETTER_PITCHES } from '../constants';
import { NoteName, ChordQuality, VoicingType } from '../types';

export const getPitch = (note: string): number => {
  const base = note.charAt(0).toUpperCase();
  let pitch = LETTER_PITCHES[base];
  const accidentals = note.slice(1);
  for (const char of accidentals) {
    if (char === '#') pitch += 1;
    else if (char === 'b') pitch -= 1;
    else if (char === 'x') pitch += 2; 
  }
  return (pitch + 120) % 12;
};

export const spellNote = (root: string, degreeOffset: number, targetSemitones: number): string => {
  const rootLetter = root.charAt(0).toUpperCase();
  const rootPitch = getPitch(root);
  const rootLetterIdx = LETTERS.indexOf(rootLetter);
  const targetLetter = LETTERS[(rootLetterIdx + degreeOffset) % 7];
  const naturalTargetPitch = LETTER_PITCHES[targetLetter];
  const targetPitch = (rootPitch + targetSemitones) % 12;
  let diff = (targetPitch - naturalTargetPitch + 12) % 12;
  if (diff > 6) diff -= 12;
  let accidentals = '';
  if (diff === 1) accidentals = '#';
  else if (diff === 2) accidentals = '##';
  else if (diff === -1) accidentals = 'b';
  else if (diff === -2) accidentals = 'bb';
  return targetLetter + accidentals;
};

export const getNoteAtPitch = (stringIndex: number, fret: number): number => {
  const openNoteValue = STRING_TUNING[stringIndex];
  return (openNoteValue + fret) % 12;
};

export const getChordNotes = (root: string, quality: ChordQuality): string[] => {
  const specs = CHORD_SPELLS[quality];
  return specs.map(spec => spellNote(root, spec.degree, spec.semitones));
};

const isValidStretch = (frets: number[], strings: number[], voicingType: VoicingType): boolean => {
  const maxFret = Math.max(...frets);
  const minFret = Math.min(...frets);
  const span = maxFret - minFret;

  if (voicingType === VoicingType.OPEN_TRIAD) {
    return span <= 5;
  }
  if (voicingType === VoicingType.DROP_3) {
    return span <= 4; 
  }
  
  return span <= 3;
};

function getCombinations<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  function backtrack(start: number, path: T[]) {
    if (path.length === size) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      backtrack(i + 1, [...path, array[i]]);
    }
  }
  backtrack(0, []);
  return result;
}

function findValidVoicings(chordPitches: number[], strings: number[], voicingType: VoicingType) {
  const voicings: { frets: number[], usedStrings: number[], windowStart: number }[] = [];
  const targetSet = new Set(chordPitches);
  const topString = strings[0];

  for (let startFret = 0; startFret <= 11; startFret++) {
    if (voicingType === VoicingType.OPEN_TRIAD) {
      const otherStrings = strings.slice(1);
      const possibleCombos = getCombinations(otherStrings, 2)
        .map(c => [topString, ...c])
        .filter(combo => {
          const sorted = [...combo].sort((a, b) => a - b);
          const isAdjacent = (sorted[1] - sorted[0] === 1) && (sorted[2] - sorted[1] === 1);
          return !isAdjacent;
        });

      for (const combo of possibleCombos) {
        const sortedCombo = [...combo].sort((a, b) => a - b);
        const stringOptions = sortedCombo.map(s => {
          const opts: number[] = [];
          for (let f = startFret; f <= startFret + 4; f++) {
            if (targetSet.has(getNoteAtPitch(s - 1, f))) opts.push(f);
          }
          return opts;
        });

        if (stringOptions.some(opts => opts.length === 0)) continue;

        const results: number[][] = [];
        const backtrack = (idx: number, current: number[]) => {
          if (idx === sortedCombo.length) {
            if (!isValidStretch(current, sortedCombo, voicingType)) return;
            const currentPitches = new Set(current.map((f, i) => getNoteAtPitch(sortedCombo[i] - 1, f)));
            if (currentPitches.size === targetSet.size) results.push([...current]);
            return;
          }
          for (const f of stringOptions[idx]) backtrack(idx + 1, [...current, f]);
        };
        backtrack(0, []);
        results.forEach(frets => voicings.push({ frets, usedStrings: sortedCombo, windowStart: startFret }));
      }
    } else if (voicingType === VoicingType.DROP_3) {
      const possibleCombos = getCombinations(strings, 4).filter(combo => {
        const sorted = [...combo].sort((a, b) => a - b);
        return (sorted[1] - sorted[0] === 2) && (sorted[2] - sorted[1] === 1) && (sorted[3] - sorted[2] === 1);
      });

      for (const combo of possibleCombos) {
        const sortedCombo = [...combo].sort((a, b) => a - b);
        const stringOptions = sortedCombo.map(s => {
          const opts: number[] = [];
          for (let f = startFret; f <= startFret + 4; f++) {
            if (targetSet.has(getNoteAtPitch(s - 1, f))) opts.push(f);
          }
          return opts;
        });

        if (stringOptions.some(opts => opts.length === 0)) continue;

        const results: number[][] = [];
        const backtrack = (idx: number, current: number[]) => {
          if (idx === sortedCombo.length) {
            if (!isValidStretch(current, sortedCombo, voicingType)) return;
            const currentPitches = new Set(current.map((f, i) => getNoteAtPitch(sortedCombo[i] - 1, f)));
            if (currentPitches.size === targetSet.size) results.push([...current]);
            return;
          }
          for (const f of stringOptions[idx]) backtrack(idx + 1, [...current, f]);
        };
        backtrack(0, []);
        results.forEach(frets => voicings.push({ frets, usedStrings: sortedCombo, windowStart: startFret }));
      }
    } else {
      const stringOptions = strings.map(s => {
        const opts: number[] = [];
        for (let f = startFret; f <= startFret + 4; f++) {
          if (targetSet.has(getNoteAtPitch(s - 1, f))) opts.push(f);
        }
        return opts;
      });

      if (stringOptions.some(opts => opts.length === 0)) continue;

      const results: number[][] = [];
      const backtrack = (idx: number, current: number[]) => {
        if (idx === strings.length) {
          if (!isValidStretch(current, strings, voicingType)) return;
          const currentPitches = new Set(current.map((f, i) => getNoteAtPitch(strings[i] - 1, f)));
          if (currentPitches.size === targetSet.size) results.push([...current]);
          return;
        }
        for (const f of stringOptions[idx]) backtrack(idx + 1, [...current, f]);
      };
      backtrack(0, []);
      results.forEach(frets => voicings.push({ frets, usedStrings: strings, windowStart: startFret }));
    }
  }
  return voicings;
}

export const generateRandomPuzzle = (
  allowedTypes: VoicingType[] = [VoicingType.TRIAD, VoicingType.OPEN_TRIAD, VoicingType.DROP_2, VoicingType.DROP_3],
  allowedRoots: NoteName[] = NOTE_NAMES
) => {
  let attempts = 0;
  const typesToUse = allowedTypes.length > 0 ? allowedTypes : [VoicingType.TRIAD];
  const rootsToUse = allowedRoots.length > 0 ? allowedRoots : NOTE_NAMES;

  while (attempts < 200) {
    attempts++;
    const rootNote = rootsToUse[Math.floor(Math.random() * rootsToUse.length)];
    const voicingType = typesToUse[Math.floor(Math.random() * typesToUse.length)];

    const isTriadKind = voicingType === VoicingType.TRIAD || voicingType === VoicingType.OPEN_TRIAD;
    const qualityPool = isTriadKind
      ? [ChordQuality.MAJOR, ChordQuality.MINOR, ChordQuality.AUGMENTED, ChordQuality.DIMINISHED]
      : [ChordQuality.MAJOR_7, ChordQuality.MINOR_7, ChordQuality.DOMINANT_7, ChordQuality.HALF_DIMINISHED_7, ChordQuality.DIMINISHED_7];
    
    const quality = qualityPool[Math.floor(Math.random() * qualityPool.length)];
    const stringsSetList = VOICING_STRING_SETS[voicingType];
    const strings = stringsSetList[Math.floor(Math.random() * stringsSetList.length)];
    const chordNotes = getChordNotes(rootNote, quality);
    const chordPitches = chordNotes.map(getPitch);

    const validVoicings = findValidVoicings(chordPitches, strings, voicingType);

    if (validVoicings.length > 0) {
      const degreeGroups: Record<number, typeof validVoicings> = {};
      validVoicings.forEach(v => {
        const topFret = v.frets[0];
        const topString = v.usedStrings[0];
        const topPitch = getNoteAtPitch(topString - 1, topFret);
        const degreeIdx = chordPitches.indexOf(topPitch);
        if (degreeIdx !== -1) {
          if (!degreeGroups[degreeIdx]) degreeGroups[degreeIdx] = [];
          degreeGroups[degreeIdx].push(v);
        }
      });

      const availableDegrees = Object.keys(degreeGroups);
      if (availableDegrees.length === 0) continue;

      const selectedDegree = availableDegrees[Math.floor(Math.random() * availableDegrees.length)];
      const categoryVoicings = degreeGroups[Number(selectedDegree)];
      const choice = categoryVoicings[Math.floor(Math.random() * categoryVoicings.length)];
      
      const fixedIdx = 0; 
      const fixedString = choice.usedStrings[fixedIdx];
      const fixedFret = choice.frets[fixedIdx];
      const fixedPitch = getNoteAtPitch(fixedString - 1, fixedFret);
      const fixedNoteName = chordNotes.find(n => getPitch(n) === fixedPitch) || chordNotes[0];

      return {
        currentKey: rootNote,
        rootNote,
        quality,
        voicingType,
        strings, 
        fixedRoot: { string: fixedString, fret: fixedFret },
        fixedNoteName,
        windowStartFret: choice.windowStart,
        chordNotes
      };
    }
  }

  // Fallback: 하드코딩된 'C' 대신 허용된 루트 중 첫 번째 사용
  const fallbackRoot = rootsToUse[0] || 'C';
  return {
    currentKey: fallbackRoot,
    rootNote: fallbackRoot,
    quality: ChordQuality.MAJOR,
    voicingType: VoicingType.TRIAD,
    strings: [1, 2, 3],
    fixedRoot: { string: 1, fret: 8 },
    fixedNoteName: fallbackRoot,
    windowStartFret: 7,
    chordNotes: getChordNotes(fallbackRoot, ChordQuality.MAJOR)
  };
};
