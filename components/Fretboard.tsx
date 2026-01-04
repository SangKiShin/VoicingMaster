
import React from 'react';
import { getNoteAtPitch, getPitch } from '../logic/guitarLogic';

interface FretboardProps {
  windowStart: number;
  activeStrings: number[];
  fixedRoot: { string: number; fret: number } | null;
  selectedNotes: Record<number, number>;
  onToggleNote: (stringIndex: number, fret: number) => void;
  fixedNoteName: string;
  revealNotes: boolean;
  chordNotes: string[];
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
  const stringIndices = [0, 1, 2, 3, 4, 5];

  const getSpelledNoteForReveal = (stringIdx: number, fret: number) => {
    const pitch = getNoteAtPitch(stringIdx, fret);
    const matchedNote = chordNotes.find(n => getPitch(n) === pitch);
    return matchedNote || '?';
  };

  return (
    <div className="relative bg-[#faf7f2] rounded-2xl p-2 pt-14 border border-slate-200 shadow-inner overflow-hidden">
      <div className="relative h-[220px]">
        {/* Strings Layer */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-1">
          {stringIndices.map((s) => {
            const isActive = activeStrings.includes(s + 1);
            return (
              <div key={s} className="flex items-center h-[36px]">
                <div 
                  className={`w-full transition-all duration-300 rounded-full ${
                    isActive 
                      ? 'bg-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.2)]' 
                      : 'bg-slate-300 opacity-60' // 비활성화된 줄도 실선으로 더 진하게 표시
                  }`} 
                  style={{ height: `${1 + s * 0.4}px` }} // 고정된 줄 두께 표현
                />
              </div>
            );
          })}
        </div>

        {/* Frets Grid Layer */}
        <div className="relative h-full grid grid-cols-5">
          {visibleFrets.map((fret) => (
            <div key={fret} className="relative border-r-2 border-slate-300/40 flex flex-col justify-between h-full last:border-r-0">
              {/* Compact Fret Number */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                <span className={`
                  w-8 h-8 flex items-center justify-center rounded-lg text-lg font-black tracking-tighter shadow-sm border
                  ${fret === 0 ? 'bg-amber-400 text-amber-950 border-amber-300' : 'bg-white text-slate-800 border-slate-200'}
                `}>
                  {fret}
                </span>
              </div>
              
              {/* Dot Markers */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07]">
                {[3, 5, 7, 9, 12, 15].includes(fret) && (
                  <div className="w-6 h-6 rounded-full bg-slate-900" />
                )}
              </div>

              {/* Note Interaction Nodes */}
              {stringIndices.map((stringIdx) => {
                const stringNum = stringIdx + 1;
                const isActive = activeStrings.includes(stringNum);
                const isFixedRoot = fixedRoot?.string === stringNum && fixedRoot?.fret === fret;
                const isSelected = selectedNotes[stringIdx] === fret;

                return (
                  <div
                    key={`${stringIdx}-${fret}`}
                    className={`relative h-[36px] flex items-center justify-center cursor-pointer z-10 ${!isActive ? 'cursor-not-allowed' : ''}`}
                    onClick={() => isActive && !isFixedRoot && onToggleNote(stringIdx, fret)}
                  >
                    {(isFixedRoot || isSelected) && (
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] z-30 shadow-md border animate-in zoom-in duration-150
                        ${isFixedRoot ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-emerald-500 border-emerald-400 text-white'}
                      `}>
                        {isFixedRoot ? fixedNoteName : (revealNotes ? getSpelledNoteForReveal(stringIdx, fret) : '')}
                      </div>
                    )}
                    {/* Interaction Feedback for active strings (Hover state implicit for mobile) */}
                    {isActive && !isFixedRoot && !isSelected && !revealNotes && (
                       <div className="w-5 h-5 rounded-full bg-indigo-500 opacity-0 active:opacity-20 transition-opacity" />
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
