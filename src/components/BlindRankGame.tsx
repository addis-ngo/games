import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Character } from '../types';

interface BlindRankGameProps {
  characters: Character[];
  onPlayAgain: () => void;
  onHome: () => void;
}

export const BlindRankGame: React.FC<BlindRankGameProps> = ({
  characters,
  onPlayAgain,
  onHome,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [slots, setSlots] = useState<(Character | null)[]>([null, null, null, null, null]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentCharacter = characters[currentStep];

  const handleAssignRank = (rankIndex: number) => {
    if (slots[rankIndex] !== null || isCompleted) return;

    const nextSlots = [...slots];
    nextSlots[rankIndex] = currentCharacter;
    setSlots(nextSlots);

    if (currentStep < characters.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const rankBadges = [
    { rank: 1, label: '#1 Top Pick', bg: 'bg-amber-300 text-amber-950 border-2 border-white' },
    { rank: 2, label: '#2 Runner Up', bg: 'bg-sky-300 text-sky-950 border-2 border-white' },
    { rank: 3, label: '#3 Bronze', bg: 'bg-emerald-300 text-emerald-950 border-2 border-white' },
    { rank: 4, label: '#4 Fourth', bg: 'bg-purple-300 text-purple-950 border-2 border-white' },
    { rank: 5, label: '#5 Fifth', bg: 'bg-rose-300 text-rose-950 border-2 border-white' },
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-white bg-blue-dot-grid text-slate-900 font-comic flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden select-none">
      {/* Main Console Card Box (Rounded Rectangle) */}
      <div className="w-full max-w-md sm:max-w-2xl max-h-[calc(100dvh-2rem)] bg-[#a5b4fc]/95 backdrop-blur-xl px-4 sm:px-8 pt-2 pb-4 sm:pb-6 shadow-[0_25px_60px_rgba(165,180,252,0.45)] border-4 border-white rounded-3xl flex flex-col items-center text-center relative z-10 ring-4 ring-indigo-300/50 transition-all duration-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full h-full flex flex-col items-center overflow-hidden flex-1 min-h-0"
        >
          {/* GAME TITLE HEADER - Hanging off top edge */}
          {!isCompleted ? (
            <h1 className="text-3xl sm:text-5xl font-bangers tracking-wider text-white uppercase -mt-9 sm:-mt-11 mb-1 transform -rotate-1 hover:scale-105 transition-transform duration-300 [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:2.5px_black] pointer-events-auto shrink-0 drop-shadow-md">
              Blind Rank
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-5xl font-bangers tracking-wider text-white uppercase -mt-9 sm:-mt-11 mb-1 transform -rotate-1 hover:scale-105 transition-transform duration-300 [-webkit-text-stroke:2px_black] sm:[-webkit-text-stroke:2.5px_black] pointer-events-auto shrink-0 drop-shadow-md">
              Final Blind Ranking
            </h1>
          )}

          {!isCompleted && (
            <div className="mb-1.5 shrink-0">
              <span className="font-comic font-black text-xs text-black bg-amber-300 px-3 py-0.5 border-2 border-white rounded-full uppercase tracking-wider shadow-sm">
                {currentStep + 1} / 5
              </span>
            </div>
          )}

          {/* ACTIVE RANKING SCREEN */}
          {!isCompleted && currentCharacter && (
            <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between overflow-hidden">
              <div className="text-xs font-comic font-bold tracking-wider text-black uppercase mb-1 shrink-0">
                Where do you rank this character?
              </div>

            {/* Split layout: Character Card on Top/Left, Slots on Bottom/Right */}
            <div className="w-full flex-1 min-h-0 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 overflow-hidden">
              {/* Current Revealed Character Card - Image, Name, Category each on their own row */}
              <div className="w-full sm:w-5/12 bg-white/95 backdrop-blur-md border-2 border-white p-2.5 sm:p-3.5 flex flex-col items-center justify-center text-center shadow-sm rounded-2xl shrink-0 sm:shrink">
                {/* Row 1: Image */}
                <div className="w-20 h-20 sm:w-32 sm:h-32 bg-amber-100 border-2 border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden relative shadow-inner shrink-0 mb-1.5">
                  <img
                    src={currentCharacter.imageUrl}
                    alt={currentCharacter.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Row 2: Name */}
                <div className="w-full text-sm sm:text-base font-comic font-black text-black tracking-wider uppercase truncate mb-1">
                  {currentCharacter.name}
                </div>
                {/* Row 3: Category */}
                <div className="text-[10px] sm:text-[11px] font-comic font-bold text-black bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200 inline-block truncate max-w-full">
                  {currentCharacter.category || currentCharacter.theme || 'Anime'}
                </div>
              </div>

              {/* Rank Slots Grid (1 to 5) */}
              <div className="w-full sm:w-7/12 space-y-1 sm:space-y-1.5 flex-1 flex flex-col justify-center min-h-0">
                {slots.map((assignedChar, idx) => {
                  const isOccupied = assignedChar !== null;
                  const badge = rankBadges[idx];

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleAssignRank(idx)}
                      className={`w-full py-1.5 px-2.5 sm:py-2 sm:px-3 transition-all flex items-center justify-between border-2 border-white rounded-xl sm:rounded-2xl shadow-sm cursor-pointer ${
                        isOccupied
                          ? 'bg-slate-200/80 text-black opacity-80 cursor-not-allowed'
                          : 'bg-white/90 hover:bg-amber-200 text-black active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-comic font-black text-xs ${badge.bg} shadow-xs text-black shrink-0`}>
                          {idx + 1}
                        </div>
                        <span className="font-comic font-bold text-xs uppercase tracking-wider text-black truncate">
                          {isOccupied ? assignedChar.name : `Rank #${idx + 1}`}
                        </span>
                      </div>

                      {isOccupied ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] sm:text-[10px] font-comic font-bold text-black uppercase bg-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300">
                            PLACED
                          </span>
                          <img
                            src={assignedChar.imageUrl}
                            alt={assignedChar.name}
                            className="w-6 h-6 sm:w-7 sm:h-7 object-cover rounded-full border border-slate-300"
                          />
                        </div>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-comic font-bold text-black uppercase bg-amber-300 px-2 py-0.5 rounded-full border border-white shrink-0">
                          SELECT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {isCompleted && (
          <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <p className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-2 shrink-0">
              Here is your ranked list from 1 to 5!
            </p>

            {/* Final List */}
            <div className="w-full space-y-1.5 sm:space-y-2 mb-3 flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
              {slots.map((char, idx) => {
                if (!char) return null;
                const badge = rankBadges[idx];

                return (
                  <div
                    key={idx}
                    className="w-full py-1.5 px-3 sm:py-2.5 sm:px-3.5 flex items-center justify-between bg-white/90 border-2 border-white rounded-xl sm:rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-comic font-black text-xs sm:text-sm ${badge.bg} text-black shrink-0`}>
                        #{idx + 1}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-comic font-black text-xs sm:text-sm uppercase tracking-wider text-black truncate">
                          {char.name}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-comic font-bold text-black uppercase">
                          {char.category || char.theme || 'Anime'}
                        </div>
                      </div>
                    </div>

                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-7 h-7 sm:w-9 sm:h-9 object-cover rounded-full border border-slate-300 shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="w-full shrink-0">
              <button
                type="button"
                onClick={onHome}
                className="w-full py-2.5 sm:py-3.5 px-6 bg-teal-300 hover:bg-teal-200 text-black font-comic font-black text-xs uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md active:scale-[0.98] cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
};

