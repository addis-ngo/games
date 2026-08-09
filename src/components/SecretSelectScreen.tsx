import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Character, Player } from '../types';
import { getGuessWhoSettings } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';

interface SecretSelectScreenProps {
  player: Player;
  characters: Character[];
  onSelect: (characterId: string) => void;
}

export const SecretSelectScreen: React.FC<SecretSelectScreenProps> = ({
  player,
  characters,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingChar, setPendingChar] = useState<Character | null>(null);

  const gwSettings = getGuessWhoSettings();
  const playerLabel = player === 'P1' ? (gwSettings.p1Name || 'Player 1') : (gwSettings.p2Name || 'Player 2');
  const isP1 = player === 'P1';
  const bgClass = isP1 ? 'bg-blue-600' : 'bg-red-600';

  const handleCardClick = (char: Character) => {
    setSelectedId(char.id);
    setPendingChar(char);
  };

  const handleConfirmTopBtn = () => {
    if (selectedId) {
      const char = characters.find((c) => c.id === selectedId);
      if (char) {
        setPendingChar(char);
      }
    }
  };

  const handleModalConfirm = () => {
    if (pendingChar) {
      onSelect(pendingChar.id);
      setPendingChar(null);
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col p-4 sm:p-6 select-none`}>
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/20 gap-3">
          <div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
              {playerLabel}
            </div>
            <h1 className="text-xl font-light tracking-tight text-white">Choose Your Secret Character</h1>
          </div>

          <button
            disabled={!selectedId}
            onClick={handleConfirmTopBtn}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedId
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md border border-white/10'
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
            }`}
          >
            Confirm Character
            <Check className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of 24 yellow character boxes */}
        <div className="py-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 flex-1">
          {characters.map((char) => {
            const isSelected = selectedId === char.id;
            return (
              <button
                key={char.id}
                onClick={() => handleCardClick(char)}
                className={`group rounded-xl border p-2 flex flex-col items-center text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-300 border-slate-900 ring-4 ring-yellow-200 scale-[1.03] shadow-md'
                    : 'bg-amber-300 border-amber-400 hover:bg-amber-200 hover:border-amber-500 shadow-xs'
                }`}
              >
                <div className="w-full aspect-square rounded-lg bg-amber-100 overflow-hidden mb-2 border border-amber-400/40 relative">
                  <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-900 truncate w-full">
                  {char.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pop up Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingChar}
        character={pendingChar}
        questionText={pendingChar ? `Do you want to choose ${pendingChar.name} as your character?` : ''}
        onConfirm={handleModalConfirm}
        onCancel={() => setPendingChar(null)}
      />
    </div>
  );
};

