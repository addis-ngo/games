import React, { useState } from 'react';
import { Target, ArrowRight, Eye, AlertCircle } from 'lucide-react';
import { Character, Player, PlayerState } from '../types';
import { getGuessWhoSettings } from '../utils/storage';
import { GuessModal } from './GuessModal';

interface GameBoardProps {
  currentTurn: Player;
  characters: Character[];
  playerState: PlayerState;
  opponentSecretCharacterId: string | null;
  lastMessage: string | null;
  onToggleEliminated: (characterId: string) => void;
  onGuessCharacter: (characterId: string) => void;
  onEndTurn: () => void;
  onResetGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  currentTurn,
  characters,
  playerState,
  lastMessage,
  onToggleEliminated,
  onGuessCharacter,
  onEndTurn,
}) => {
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [showOwnSecret, setShowOwnSecret] = useState(false);

  const gwSettings = getGuessWhoSettings();
  const p1Name = gwSettings.p1Name || 'Player 1';
  const p2Name = gwSettings.p2Name || 'Player 2';
  const playerLabel = currentTurn === 'P1' ? p1Name : p2Name;

  const popId = currentTurn === 'P1' ? gwSettings.p1PopId : gwSettings.p2PopId;
  const popChar = characters.find((c) => c.id === popId);

  const mySecretChar = characters.find((c) => c.id === playerState.secretCharacterId);

  // Count remaining active characters
  const totalCharacters = characters.length;
  const eliminatedCount = playerState.eliminatedIds.length;
  const remainingCount = totalCharacters - eliminatedCount;

  const isP1 = currentTurn === 'P1';
  const bgClass = isP1 ? 'bg-blue-600' : 'bg-red-600';
  const headerBadgeBg = isP1 ? 'bg-blue-950 text-blue-100' : 'bg-red-950 text-red-100';

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col p-4 sm:p-6 select-none font-comic`}>
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/20 gap-3">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl ${headerBadgeBg} text-xs font-bold tracking-wide shadow-xs flex items-center gap-2`}>
              {popChar && (
                <img
                  src={popChar.imageUrl}
                  alt={playerLabel}
                  className="w-5 h-5 rounded-full object-cover border border-white shrink-0"
                />
              )}
              <span>{playerLabel}</span>
            </div>
            <div className="text-xs font-bold text-white/90">
              {remainingCount} / {totalCharacters} remaining
            </div>
          </div>

          {/* Secret Character Card & Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Own Secret Character Toggle */}
            {mySecretChar && (
              <div className="relative">
                <button
                  onClick={() => setShowOwnSecret(!showOwnSecret)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors backdrop-blur-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-white/80" />
                  Your Character
                </button>

                {/* Popup preview */}
                {showOwnSecret && (
                  <div className="absolute right-0 top-10 z-30 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center text-center w-36">
                    <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
                      Your Character
                    </div>
                    <div className="w-20 h-20 rounded-xl bg-amber-300 overflow-hidden border border-amber-400 mb-1.5">
                      <img
                        src={mySecretChar.imageUrl}
                        alt={mySecretChar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{mySecretChar.name}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Banner (e.g. wrong guess feedback) */}
        {lastMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center gap-2.5 shadow-md animate-in slide-in-from-top-2 duration-150 border border-white/10">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lastMessage}</span>
          </div>
        )}

        {/* Main Grid & Side Controls Layout */}
        <div className="py-6 flex flex-col lg:flex-row gap-6 flex-1 items-start">
          {/* The 24 Yellow Face Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 flex-1 w-full">
            {characters.map((char) => {
              const isEliminated = playerState.eliminatedIds.includes(char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => onToggleEliminated(char.id)}
                  className={`group rounded-xl border p-2 flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden ${
                    isEliminated
                      ? 'bg-amber-200/20 border-yellow-400/20 opacity-30 grayscale scale-95'
                      : 'bg-amber-300 border-amber-400 hover:bg-amber-200 hover:border-amber-500 shadow-sm hover:shadow-md text-slate-900'
                  }`}
                >
                  {/* Image */}
                  <div className="w-full aspect-square rounded-lg bg-amber-100 overflow-hidden mb-2 border border-amber-400/40 relative">
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    
                    {/* Face Down / Eliminated Visual */}
                    {isEliminated && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className={`text-xs font-bold truncate w-full ${
                      isEliminated ? 'text-slate-500 line-through' : 'text-slate-900'
                    }`}
                  >
                    {char.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Side Actions Panel */}
          <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-3 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={() => setIsGuessModalOpen(true)}
              className="flex-1 lg:w-full py-3.5 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.99] backdrop-blur-xs"
            >
              <Target className="w-4 h-4 text-amber-300" />
              Guess Character
            </button>

            <button
              onClick={onEndTurn}
              className="flex-1 lg:w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] border border-white/10"
            >
              End Turn
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guess Modal */}
      <GuessModal
        isOpen={isGuessModalOpen}
        onClose={() => setIsGuessModalOpen(false)}
        characters={characters}
        onConfirmGuess={(id) => {
          setIsGuessModalOpen(false);
          onGuessCharacter(id);
        }}
      />
    </div>
  );
};
