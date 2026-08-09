import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { Character } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface GuessModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  onConfirmGuess: (characterId: string) => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  isOpen,
  onClose,
  characters,
  onConfirmGuess,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingChar, setPendingChar] = useState<Character | null>(null);

  if (!isOpen) return null;

  const handleCardClick = (char: Character) => {
    setSelectedId(char.id);
    setPendingChar(char);
  };

  const handleBottomMakeGuessClick = () => {
    if (selectedId) {
      const char = characters.find((c) => c.id === selectedId);
      if (char) {
        setPendingChar(char);
      }
    }
  };

  const handleModalConfirm = () => {
    if (pendingChar) {
      onConfirmGuess(pendingChar.id);
      setSelectedId(null);
      setPendingChar(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Guess Secret Character</h2>
              <p className="text-xs text-slate-400">Select who you think the opponent chose to win!</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {characters.map((char) => {
              const isSelected = selectedId === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => handleCardClick(char)}
                  className={`rounded-xl border p-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-300 border-slate-900 ring-4 ring-yellow-300 scale-[1.03] shadow-md'
                      : 'bg-amber-300 border-amber-400 hover:bg-amber-200'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg bg-amber-100 overflow-hidden mb-1.5 border border-amber-400/40">
                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate w-full">
                    {char.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedId}
              onClick={handleBottomMakeGuessClick}
              className={`px-5 py-2 text-xs font-medium flex items-center gap-2 rounded-lg transition-colors cursor-pointer ${
                selectedId
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Make Guess
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      <ConfirmModal
        isOpen={!!pendingChar}
        character={pendingChar}
        questionText={pendingChar ? `Do you want to choose ${pendingChar.name} as your character?` : ''}
        onConfirm={handleModalConfirm}
        onCancel={() => setPendingChar(null)}
      />
    </>
  );
};

