
import React, { useState, useCallback } from 'react';
import { VoicingType, ChordQuality, GameState, NoteName } from './types';
import { generateRandomPuzzle, getPitch, getNoteAtPitch } from './logic/guitarLogic';
import { NOTE_NAMES } from './constants';
import Fretboard from './components/Fretboard';
import { 
  Trophy, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Music, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  RefreshCw,
  Settings2,
  Hash
} from 'lucide-react';

const INITIAL_RANDOM_ROOT = 'C';

// UI 표시용 17개 루트 노트 (C#과 Db 등 이명동음을 구분하여 배치)
const ROOT_DISPLAY_OPTIONS = [
  { id: 'C', label: 'C' },
  { id: 'C#', label: 'C#' },
  { id: 'Db', label: 'Db' },
  { id: 'D', label: 'D' },
  { id: 'D#', label: 'D#' },
  { id: 'Eb', label: 'Eb' },
  { id: 'E', label: 'E' },
  { id: 'F', label: 'F' },
  { id: 'F#', label: 'F#' },
  { id: 'Gb', label: 'Gb' },
  { id: 'G', label: 'G' },
  { id: 'G#', label: 'G#' },
  { id: 'Ab', label: 'Ab' },
  { id: 'A', label: 'A' },
  { id: 'A#', label: 'A#' },
  { id: 'Bb', label: 'Bb' },
  { id: 'B', label: 'B' },
];

const App: React.FC = () => {
  const [enabledTypes, setEnabledTypes] = useState<VoicingType[]>([VoicingType.TRIAD]);
  const [enabledRoots, setEnabledRoots] = useState<NoteName[]>([INITIAL_RANDOM_ROOT]);

  const [gameState, setGameState] = useState<GameState>(() => {
    const puzzle = generateRandomPuzzle([VoicingType.TRIAD], [INITIAL_RANDOM_ROOT]);
    return {
      ...puzzle,
      selectedNotes: {},
      score: 0,
      totalAttempts: 0,
      isGameOver: false,
      feedback: null
    };
  });

  const startNewGame = useCallback(() => {
    const puzzle = generateRandomPuzzle(enabledTypes, enabledRoots);
    setGameState(prev => ({
      ...puzzle,
      selectedNotes: {},
      score: prev?.score || 0,
      totalAttempts: prev?.totalAttempts || 0,
      isGameOver: false,
      feedback: null
    }));
  }, [enabledTypes, enabledRoots]);

  const tryAgain = useCallback(() => {
    setGameState(prev => prev ? { ...prev, selectedNotes: {}, feedback: null } : prev);
  }, []);

  const toggleVoicingType = (type: VoicingType) => {
    setEnabledTypes(prev => prev.includes(type) ? (prev.length === 1 ? prev : prev.filter(t => t !== type)) : [...prev, type]);
  };

  const toggleRootNote = (note: NoteName) => {
    setEnabledRoots(prev => prev.includes(note) ? (prev.length === 1 ? prev : prev.filter(n => n !== note)) : [...prev, note]);
  };

  const selectAllRoots = () => setEnabledRoots([...NOTE_NAMES]);
  const clearAllRoots = () => setEnabledRoots(['C']);

  const handleToggleNote = (stringIdx: number, fret: number) => {
    if (!gameState || gameState.feedback) return;
    setGameState(prev => {
      const newSelected = { ...prev.selectedNotes };
      if (newSelected[stringIdx] === fret) delete newSelected[stringIdx];
      else newSelected[stringIdx] = fret;
      return { ...prev, selectedNotes: newSelected };
    });
  };

  const checkAnswer = () => {
    if (!gameState) return;
    const targetPitches = gameState.chordNotes.map(n => getPitch(n));
    const targetPitchesSet = new Set(targetPitches);
    const fixedRootStringIdx = gameState.fixedRoot.string - 1;
    const selectedPitches = [
      getNoteAtPitch(fixedRootStringIdx, gameState.fixedRoot.fret),
      ...Object.entries(gameState.selectedNotes).map(([sIdx, fret]) => getNoteAtPitch(Number(sIdx), fret as number))
    ];
    const selectedPitchesSet = new Set(selectedPitches);
    const allSelectedStringIndices = [...Object.keys(gameState.selectedNotes).map(Number), fixedRootStringIdx].sort();
    let harmonyCorrect = selectedPitchesSet.size === targetPitchesSet.size;
    if (harmonyCorrect) {
      for (const p of selectedPitchesSet) {
        if (!targetPitchesSet.has(p)) { harmonyCorrect = false; break; }
      }
    }
    const isFourNoteVoicing = gameState.voicingType === VoicingType.DROP_2 || gameState.voicingType === VoicingType.DROP_3;
    const expectedNoteCount = isFourNoteVoicing ? 4 : 3;
    const isCorrect = harmonyCorrect && allSelectedStringIndices.length === expectedNoteCount;
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalAttempts: prev.totalAttempts + 1,
      feedback: isCorrect ? 'correct' : 'wrong'
    }));
  };

  const shiftWindow = (dir: 'left' | 'right') => {
    setGameState(prev => {
      let newStart = dir === 'left' ? prev.windowStartFret - 1 : prev.windowStartFret + 1;
      return { ...prev, windowStartFret: Math.max(0, Math.min(11, newStart)) };
    });
  };

  const isFourNoteVoicing = gameState.voicingType === VoicingType.DROP_2 || gameState.voicingType === VoicingType.DROP_3;
  const expectedNotes = isFourNoteVoicing ? 4 : 3;
  const numCurrentNotes = Object.keys(gameState.selectedNotes).length + 1;
  const canCheck = numCurrentNotes === expectedNotes;

  return (
    <div className="max-w-2xl mx-auto p-3 md:p-6 min-h-screen flex flex-col gap-2">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-2 px-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-indigo-600" />
          <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Voicing Master</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">{gameState.score}</span>
          </div>
          <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            {gameState.totalAttempts === 0 ? '0%' : Math.round((gameState.score / gameState.totalAttempts) * 100) + '%'}
          </div>
        </div>
      </header>

      {/* Target Info */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200 flex flex-col justify-center">
          <span className="text-[8px] text-indigo-200 font-bold uppercase tracking-widest leading-none mb-1">Target Chord</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{gameState.rootNote}</span>
            <span className="text-lg font-bold text-indigo-200">{gameState.quality}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col justify-center">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Voicing</span>
          <span className="text-sm font-bold text-slate-800 truncate">{gameState.voicingType}</span>
          <span className="text-[8px] text-slate-400 font-medium">({expectedNotes} notes)</span>
        </div>
      </div>

      {/* Fretboard Section */}
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-2">
        <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-1 px-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
               <HelpCircle className="w-3 h-3 text-indigo-400" />
               Window Control
            </div>
            <div className="flex gap-1">
              <button onClick={() => shiftWindow('left')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg active:bg-slate-100 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => shiftWindow('right')} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg active:bg-slate-100 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <Fretboard 
            windowStart={gameState.windowStartFret}
            activeStrings={gameState.strings}
            fixedRoot={gameState.fixedRoot}
            selectedNotes={gameState.selectedNotes}
            onToggleNote={handleToggleNote}
            fixedNoteName={gameState.fixedNoteName}
            revealNotes={!!gameState.feedback}
            chordNotes={gameState.chordNotes}
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-auto py-2">
        {!gameState.feedback ? (
          <button
            onClick={checkAnswer}
            disabled={!canCheck}
            className={`w-full py-4 rounded-2xl text-sm font-bold transition-all shadow-md ${canCheck ? 'bg-indigo-600 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Verify Voicing
          </button>
        ) : (
          <div className="animate-in fade-in zoom-in duration-200 flex flex-col gap-2">
            <div className={`py-3 rounded-xl border flex items-center justify-center gap-2 ${gameState.feedback === 'correct' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
              {gameState.feedback === 'correct' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span className="text-sm font-bold">{gameState.feedback === 'correct' ? 'Perfect Match!' : 'Incorrect Notes'}</span>
            </div>
            <div className="flex gap-2">
              {gameState.feedback === 'wrong' && (
                <button onClick={tryAgain} className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 text-xs flex items-center justify-center gap-1 active:bg-slate-50 transition-colors"><RefreshCw className="w-3 h-3" /> Retry</button>
              )}
              <button onClick={startNewGame} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform"><RotateCcw className="w-3 h-3" /> Next Challenge</button>
            </div>
          </div>
        )}
      </div>

      {/* Training Options */}
      <details className="group border-t border-slate-200 pt-2 mt-1">
        <summary className="list-none flex justify-center items-center gap-1 text-[10px] font-bold text-slate-400 cursor-pointer uppercase tracking-widest hover:text-indigo-500 transition-colors">
          <Settings2 className="w-3 h-3" /> Setup Training
        </summary>
        <div className="mt-2 space-y-3 p-1 animate-in slide-in-from-top-2 duration-200">
           <div className="bg-slate-100/50 p-2 rounded-xl">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase"><Hash className="w-2 h-2" /> Roots (17 Options)</div>
                <button onClick={selectAllRoots} className="text-[8px] font-bold text-indigo-600 hover:underline">SELECT ALL</button>
             </div>
             <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
               {ROOT_DISPLAY_OPTIONS.map(opt => (
                 <button 
                  key={opt.id} 
                  onClick={() => toggleRootNote(opt.id)} 
                  className={`py-1.5 rounded-lg text-[10px] font-bold transition-all border ${enabledRoots.includes(opt.id) ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                 >
                   {opt.label}
                 </button>
               ))}
             </div>
           </div>
           <div className="bg-slate-100/50 p-2 rounded-xl">
             <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold mb-2 uppercase"><Settings2 className="w-2 h-2" /> Voicing Types</div>
             <div className="flex flex-wrap gap-1">
               {Object.values(VoicingType).map(t => (
                 <button key={t} onClick={() => toggleVoicingType(t)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${enabledTypes.includes(t) ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>{t}</button>
               ))}
             </div>
           </div>
        </div>
      </details>
    </div>
  );
};

export default App;
