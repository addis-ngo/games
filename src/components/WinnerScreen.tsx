import React from 'react';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import { Character, Player } from '../types';
import { getGuessWhoSettings } from '../utils/storage';

interface WinnerScreenProps {
  winner: Player;
  p1SecretChar: Character | undefined;
  p2SecretChar: Character | undefined;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  winner,
  p1SecretChar,
  p2SecretChar,
  onPlayAgain,
  onHome,
}) => {
  const gwSettings = getGuessWhoSettings();
  const p1Name = gwSettings.p1Name || 'Player 1';
  const p2Name = gwSettings.p2Name || 'Player 2';
  const winnerLabel = winner === 'P1' ? p1Name : p2Name;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none font-comic">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bangers tracking-wide uppercase text-slate-900 mb-2">
          {winnerLabel} Wins!
        </h1>
        <p className="text-xs font-comic text-slate-500 mb-8">
          The correct character was identified!
        </p>

        {/* Revealed Secret Characters */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          {/* P1 Secret */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 truncate max-w-full">
              {p1Name}'s Character
            </span>
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 mb-2">
              {p1SecretChar && (
                <img
                  src={p1SecretChar.imageUrl}
                  alt={p1SecretChar.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs font-bold text-slate-800">
              {p1SecretChar?.name || 'Unknown'}
            </span>
          </div>

          {/* P2 Secret */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 truncate max-w-full">
              {p2Name}'s Character
            </span>
            <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 mb-2">
              {p2SecretChar && (
                <img
                  src={p2SecretChar.imageUrl}
                  alt={p2SecretChar.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs font-medium text-slate-800">
              {p2SecretChar?.name || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.99]"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>

          <button
            onClick={onHome}
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-medium text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
          >
            <Home className="w-4 h-4 text-slate-500" />
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
