
import React, { useState, useEffect, useCallback } from 'react';
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

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  const [enabledTypes, setEnabledTypes] = useState<VoicingType[]>([
    VoicingType.TRIAD
  ]);
  
  const [enabledRoots, setEnabledRoots] = useState<NoteName[]>(() => [
    NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)]
  ]);

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
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        selectedNotes: {},
        feedback: null
      };
    });
  }, []);

  const toggleVoicingType = (type: VoicingType) => {
    setEnabledTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const toggleRootNote = (note: NoteName) => {
    setEnabledRoots(prev => {
      if (prev.includes(note)) {
        if (prev.length === 1) return prev;
        return prev.filter(n => n !== note);
      }
      return [...prev, note];
    });
  };

  const selectAllRoots = () => setEnabledRoots([...NOTE_NAMES]);
  const clearAllRoots = () => {
    setEnabledRoots(['C']);
  };

  useEffect(() => {
    const puzzle = generateRandomPuzzle(enabledTypes, enabledRoots);
    setGameState({
      ...puzzle,
      selectedNotes: {},
      score: 0,
      totalAttempts: 0,
      isGameOver: false,
      feedback: null
    });
  }, []);

  const handleToggleNote = (stringIdx: number, fret: number) => {
    if (!gameState || gameState.feedback) return;

    setGameState(prev => {
      if (!prev) return null;
      const newSelected = { ...prev.selectedNotes };
      
      if (newSelected[stringIdx] === fret) {
        delete newSelected[stringIdx];
      } else {
        newSelected[stringIdx] = fret;
      }
      
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
        if (!targetPitchesSet.has(p)) {
          harmonyCorrect = false;
          break;
        }
      }
    }

    // Drop 2와 Drop 3는 모두 4개의 음을 요구함
    const isFourNoteVoicing = gameState.voicingType === VoicingType.DROP_2 || gameState.voicingType === VoicingType.DROP_3;
    const expectedNoteCount = isFourNoteVoicing ? 4 : 3;
    const structureCorrect = allSelectedStringIndices.length === expectedNoteCount;

    const isCorrect = harmonyCorrect && structureCorrect;

    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        totalAttempts: prev.totalAttempts + 1,
        feedback: isCorrect ? 'correct' : 'wrong'
      };
    });
  };

  const shiftWindow = (dir: 'left' | 'right') => {
    setGameState(prev => {
      if (!prev) return null;
      let newStart = dir === 'left' ? prev.windowStartFret - 1 : prev.windowStartFret + 1;
      newStart = Math.max(0, Math.min(11, newStart));
      return { ...prev, windowStartFret: newStart };
    });
  };

  if (!gameState) return null;

  const isFourNoteVoicing = gameState.voicingType === VoicingType.DROP_2 || gameState.voicingType === VoicingType.DROP_3;
  const expectedNotes = isFourNoteVoicing ? 4 : 3;
  const numCurrentNotes = Object.keys(gameState.selectedNotes).length + 1;
  const canCheck = numCurrentNotes === expectedNotes;

  const formatNoteLabel = (note: string) => {
    if (note === 'C#') return 'C#/Db';
    if (note === 'D#') return 'D#/Eb';
    if (note === 'F#') return 'F#/Gb';
    if (note === 'G#') return 'G#/Ab';
    if (note === 'A#') return 'A#/Bb';
    return note;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Voicing Master</h1>
            <p className="text-slate-500 text-sm">Spread & Closed Harmony Trainer</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Accuracy</span>
            <span className="text-lg font-mono font-bold text-indigo-600">
              {gameState.totalAttempts === 0 ? '0%' : Math.round((gameState.score / gameState.totalAttempts) * 100) + '%'}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Score</span>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-mono font-bold text-slate-800">{gameState.score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="space-y-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap gap-2 shadow-sm items-center">
          <div className="px-3 flex items-center gap-2 text-slate-400">
            <Settings2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Voicing Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(VoicingType).map(type => {
              const isActive = enabledTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleVoicingType(type)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm' 
                      : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100'}
                  `}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Root Note Filter</span>
            </div>
            <div className="flex gap-2">
               <button onClick={selectAllRoots} className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700">All</button>
               <button onClick={clearAllRoots} className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-500">Reset</button>
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {NOTE_NAMES.map(note => {
              const isActive = enabledRoots.includes(note);
              return (
                <button
                  key={note}
                  onClick={() => toggleRootNote(note)}
                  className={`
                    py-2 rounded-lg text-xs font-bold transition-all border
                    ${isActive 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}
                  `}
                >
                  {formatNoteLabel(note)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 space-y-8">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 md:col-span-2">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Target Chord</p>
              <p className="text-5xl font-black text-slate-900">
                {gameState.rootNote}<span className="text-indigo-600">{gameState.quality}</span>
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Voicing</p>
              <p className="text-xl font-bold text-slate-800">{gameState.voicingType}</p>
              <p className="text-[10px] mt-2 text-slate-500 font-bold uppercase">Target: {expectedNotes} notes on {gameState.strings.length} strings</p>
            </div>
          </div>

          <div className="mb-4 flex justify-between items-center text-sm px-2">
            <div className="flex items-center gap-2 text-slate-500">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>
                {gameState.voicingType === VoicingType.OPEN_TRIAD 
                  ? 'Spread the triad across the highlighted strings.' 
                  : gameState.voicingType === VoicingType.DROP_3
                  ? 'Identify the Drop 3 shape (1 string skipped between lowest note and upper block).'
                  : 'Place notes on the indicated strings.'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => shiftWindow('left')} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-all shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => shiftWindow('right')} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></button>
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

        <div className="flex flex-col items-center gap-4 py-4">
          {!gameState.feedback ? (
            <button
              onClick={checkAnswer}
              disabled={!canCheck}
              className={`px-14 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg flex items-center gap-2 ${canCheck ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              Verify Voicing
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300 w-full max-w-md">
              <div className={`flex items-center gap-3 px-8 py-4 rounded-2xl border w-full justify-center shadow-sm ${gameState.feedback === 'correct' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                {gameState.feedback === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                <span className="text-2xl font-bold">{gameState.feedback === 'correct' ? 'Perfect!' : 'Not quite...'}</span>
              </div>
              <div className="flex gap-4 w-full">
                {gameState.feedback === 'wrong' && (
                  <button onClick={tryAgain} className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 px-6 py-4 rounded-2xl font-bold border border-slate-200 shadow-md transition-all hover:scale-105"><RefreshCw className="w-5 h-5" />Try Again</button>
                )}
                <button onClick={startNewGame} className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-md transition-all hover:scale-105 ${gameState.feedback === 'correct' ? 'bg-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-900 text-white'}`}><RotateCcw className="w-5 h-5" />Next Puzzle</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-8 text-center text-slate-400 text-xs font-medium">
        <p>&copy; 2024 Guitar Voicing Master &bull; Mastering the Fretboard One Voicing at a Time</p>
      </footer>
    </div>
  );
};

export default App;
