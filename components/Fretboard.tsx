
import React from 'react';
import { getNoteAtPitch, getPitch } from '../logic/guitarLogic';

interface FretboardProps {
  windowStart: number;
  activeStrings: number[]; // 1-6
  fixedRoot: { string: number; fret: number } | null;
  selectedNotes: Record<number, number>; // stringIndex -> fret
  onToggleNote: (stringIndex: number, fret: number) => void;
  fixedNoteName: string;
  revealNotes: boolean;
  chordNotes: string[]; // Spelled notes like ["C#", "E#", "G##"]
}

const Fretboard: React.FC<FretboardProps> = ({
  windowStart,
  activeStrings,
  fixedRoot,
  selectedNotes,
  onToggleNote,
  fixedNoteName,
  revealNotes,
  chordNotes
}) => {
  const visibleFrets = [windowStart, windowStart + 1, windowStart + 2, windowStart + 3, windowStart + 4];
  const stringIndices = [0, 1, 2, 3, 4, 5]; // 0=High E (1st string), 5=Low E (6th string)

  const getSpelledNoteForReveal = (stringIdx: number, fret: number) => {
    const pitch = getNoteAtPitch(stringIdx, fret);
    // Find which note in chordNotes matches this pitch
    const matchedNote = chordNotes.find(n => getPitch(n) === pitch);
    return matchedNote || '?';
  };

  return (
    <div className="relative bg-[#faf7f2] rounded-3xl p-4 pt-24 border border-slate-200 shadow-xl mt-4">
      <div className="relative h-[300px]">
        {/* Strings (Visuals) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {stringIndices.map((s) => {
            const stringNum = s + 1;
            const isActive = activeStrings.includes(stringNum);
            return (
              <div key={s} className="flex items-center h-[50px]">
                <div 
                  className={`w-full transition-all duration-500 ${
                    isActive 
                      ? 'bg-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.2)]' 
                      : 'border-t-2 border-dashed border-slate-300'
                  }`} 
                  style={isActive ? { height: `${1 + s * 0.5}px` } : { height: '0px' }} 
                />
              </div>
            );
          })}
        </div>

        {/* Frets and Interaction Area */}
        <div className="relative h-full grid grid-cols-5">
          {visibleFrets.map((fret) => (
            <div key={fret} className="relative border-r-4 border-slate-300/40 flex flex-col justify-between h-full last:border-r-0">
              {/* Fret Number Label */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20">
                <span className={`
                  w-12 h-12 flex items-center justify-center rounded-xl text-3xl font-black tracking-tighter shadow-md border
                  ${fret === 0 
                    ? 'bg-amber-400 text-amber-950 border-amber-300' 
                    : 'bg-white text-slate-800 border-slate-200'}
                `}>
                  {fret}
                </span>
              </div>
              
              {/* Fret Markers (Dots) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                {fret === 12 ? (
                  <div className="flex flex-col gap-12">
                    <div className="w-8 h-8 rounded-full bg-slate-400" />
                    <div className="w-8 h-8 rounded-full bg-slate-400" />
                  </div>
                ) : [3, 5, 7, 9, 15].includes(fret) ? (
                  <div className="w-12 h-12 rounded-full bg-slate-400" />
                ) : null}
              </div>

              {stringIndices.map((stringIdx) => {
                const stringNum = stringIdx + 1;
                const isActive = activeStrings.includes(stringNum);
                const isFixedRoot = fixedRoot?.string === stringNum && fixedRoot?.fret === fret;
                const isSelected = selectedNotes[stringIdx] === fret;

                return (
                  <div
                    key={`${stringIdx}-${fret}`}
                    className={`group relative h-[50px] flex items-center justify-center cursor-pointer transition-all ${!isActive ? 'opacity-10 cursor-not-allowed' : ''}`}
                    onClick={() => isActive && !isFixedRoot && onToggleNote(stringIdx, fret)}
                  >
                    {(isFixedRoot || isSelected) && (
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-30 shadow-lg border-2 animate-in zoom-in duration-200
                        ${isFixedRoot ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-emerald-500 border-emerald-400 text-white'}
                      `}>
                        {isFixedRoot ? fixedNoteName : (revealNotes ? getSpelledNoteForReveal(stringIdx, fret) : '')}
                      </div>
                    )}

                    {isActive && !isFixedRoot && !isSelected && (
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 bg-white/50 opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 transition-opacity">
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fretboard;