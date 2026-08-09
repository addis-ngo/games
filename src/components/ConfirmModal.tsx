import React from 'react';
import { X, Check } from 'lucide-react';
import { Character } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  character: Character | null;
  questionText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  character,
  questionText,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !character) return null;

  const defaultQuestion = `Do you want to choose ${character.name} as your character?`;
  const message = questionText || defaultQuestion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-150 relative">
        {/* Close X Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character Card Image */}
        <div className="w-24 h-24 rounded-2xl bg-amber-300 border-2 border-amber-400 p-1 shadow-md mb-3 mt-2 relative">
          <div className="w-full h-full rounded-xl overflow-hidden bg-amber-100">
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Character Name */}
        <h3 className="text-xl font-bold text-slate-900 mb-1">
          {character.name}
        </h3>

        {/* Question Prompt */}
        <p className="text-sm font-medium text-slate-600 mb-6 px-2 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons: No & Yes */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
