import React from 'react';
import { Character, Player } from '../types';
import { getGuessWhoSettings } from '../utils/storage';

interface SecretRevealScreenProps {
  player: Player;
  character: Character;
  onConfirm: () => void;
}

export const SecretRevealScreen: React.FC<SecretRevealScreenProps> = ({
  player,
  character,
  onConfirm,
}) => {
  const gwSettings = getGuessWhoSettings();
  const playerLabel = player === 'P1' ? (gwSettings.p1Name || 'Player 1') : (gwSettings.p2Name || 'Player 2');
  const isP1 = player === 'P1';
  const bgClass = isP1 ? 'bg-blue-600' : 'bg-red-600';

  return (
    <div
      className={`min-h-screen ${bgClass} text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none font-comic`}
    >
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-900 flex flex-col items-center text-center">
        <div className="mb-2">
          <span
            className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white ${
              isP1 ? 'bg-blue-600' : 'bg-red-600'
            }`}
          >
            {playerLabel}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bangers tracking-wider text-slate-900 uppercase mb-1">
          Your Secret Character
        </h1>
        <p className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-6">
          Memorize your character!
        </p>

        {/* Character Card */}
        <div className="w-full bg-amber-100 border-3 border-amber-300 rounded-2xl p-4 mb-6 flex flex-col items-center shadow-md">
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white border-2 border-amber-400 rounded-xl overflow-hidden mb-3 shadow-inner">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xl sm:text-2xl font-comic font-black text-black uppercase tracking-wide">
            {character.name}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
            {character.category}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-4 px-6 bg-emerald-400 hover:bg-emerald-300 text-black font-comic font-black text-sm uppercase tracking-wider transition-all border-3 border-slate-900 rounded-2xl shadow-lg active:scale-[0.98] cursor-pointer"
        >
          Got It! Continue
        </button>
      </div>
    </div>
  );
};
