import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Character, ImpostorPlayerRole } from '../types';

interface CharacterImpostorGameProps {
  secretCharacter: Character;
  players: ImpostorPlayerRole[];
  impostorNames: string[];
  onHome: () => void;
}

export const CharacterImpostorGame: React.FC<CharacterImpostorGameProps> = ({
  secretCharacter,
  players,
  impostorNames,
  onHome,
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<'PASS' | 'ROLE_VIEW' | 'DISCUSSION'>('PASS');
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  const handleViewRole = () => {
    setPhase('ROLE_VIEW');
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
      setPhase('PASS');
    } else {
      setPhase('DISCUSSION');
    }
  };

  return (
    <div className="min-h-screen bg-white bg-blue-dot-grid text-slate-900 font-comic flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Main Container Card (Rounded Rectangle) */}
      <div className="w-full max-w-md sm:max-w-lg bg-[#a5b4fc]/95 backdrop-blur-xl px-6 sm:px-10 py-8 shadow-[0_25px_60px_rgba(165,180,252,0.45)] border-4 border-white rounded-3xl flex flex-col items-center text-center relative z-10 ring-4 ring-indigo-300/50 transition-all duration-300">
        {/* PHASE 1: PASS DEVICE */}
        {phase === 'PASS' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-2">
              <span className="font-comic font-black text-xs text-black bg-indigo-200 px-3.5 py-1 border-2 border-white rounded-full uppercase tracking-wider shadow-sm">
                Player {currentPlayerIndex + 1} of {players.length}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bangers tracking-wider text-white uppercase -mt-1 mb-3 transform -rotate-1 [-webkit-text-stroke:2.5px_black]">
              Pass Device To:
            </h1>

            <div className="w-full py-3.5 px-6 bg-white/95 backdrop-blur-md border-2 border-white mb-4 shadow-sm rounded-2xl">
              <span className="text-2xl sm:text-3xl font-comic font-black text-black tracking-wider uppercase">
                {currentPlayer.playerName}
              </span>
            </div>

            <p className="text-xs font-comic font-bold text-black mb-6 uppercase tracking-wider leading-relaxed">
              Ensure no other player can see the screen before tapping.
            </p>

            <button
              type="button"
              onClick={handleViewRole}
              className="w-full py-3.5 px-6 bg-amber-300 hover:bg-amber-200 text-black font-comic font-black text-sm uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
            >
              View Secret Role
            </button>
          </motion.div>
        )}

        {/* PHASE 2: ROLE VIEW */}
        {phase === 'ROLE_VIEW' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-2">
              <span className="font-comic font-black text-xs text-black bg-indigo-200 px-3.5 py-1 border-2 border-white rounded-full uppercase tracking-wider shadow-sm">
                {currentPlayer.playerName}&apos;s Role
              </span>
            </div>

            {!currentPlayer.isImpostor ? (
              /* REGULAR PLAYER ROLE */
              <div className="w-full flex flex-col items-center">
                <h2 className="text-2xl sm:text-3xl font-bangers tracking-wider text-emerald-800 uppercase mb-3">
                  Your Secret Character
                </h2>

                {/* Character Image Box */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white border-4 border-white shadow-md rounded-3xl overflow-hidden mb-3 relative group">
                  <img
                    src={secretCharacter.imageUrl}
                    alt={secretCharacter.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="text-xl sm:text-2xl font-comic font-black text-black tracking-wider uppercase mb-0.5">
                  {secretCharacter.name}
                </div>
                <div className="text-xs font-comic font-bold text-black bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200 mb-4">
                  {secretCharacter.category || secretCharacter.theme || 'Anime'}
                </div>

                <p className="text-xs font-comic font-bold text-black mb-5 uppercase tracking-wider leading-relaxed">
                  Memorize this character! Everyone else has this exact character except the Impostor.
                </p>
              </div>
            ) : (
              /* IMPOSTOR ROLE */
              <div className="w-full flex flex-col items-center py-2">
                <div className="w-full py-6 px-4 bg-rose-200/90 border-2 border-white mb-4 text-center shadow-sm rounded-2xl">
                  <div className="text-2xl sm:text-3xl font-bangers tracking-wide text-rose-950 uppercase">
                    YOU ARE THE IMPOSTOR!
                  </div>
                </div>

                <p className="text-xs font-comic font-bold text-black mb-6 uppercase tracking-wider leading-relaxed px-2">
                  You do NOT know the secret character! Blend in with the group, act natural, and convince everyone you know who it is!
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleNextPlayer}
              className="w-full py-3.5 px-6 bg-sky-300 hover:bg-sky-200 text-black font-comic font-black text-xs uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
            >
              Pass Device
            </button>
          </div>
        )}

        {/* PHASE 3: DISCUSSION & REVEAL */}
        {phase === 'DISCUSSION' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl sm:text-4xl font-bangers tracking-wider text-white uppercase mb-2 [-webkit-text-stroke:2.5px_black]">
              Discussion Time
            </h2>

            <p className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-5 leading-relaxed">
              Everyone has seen their role. Discuss with the group and vote on who the Impostor is!
            </p>

            {/* REVEAL RESULT SECTION */}
            {!isRevealed ? (
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                className="w-full py-3.5 px-6 bg-rose-300 hover:bg-rose-200 text-black font-comic font-black text-sm uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
              >
                Reveal Impostor
              </button>
            ) : (
              <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
                {/* Impostor Reveal */}
                <div className="w-full p-4 bg-rose-200 border-2 border-white mb-4 text-center shadow-sm rounded-2xl">
                  <div className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-0.5">
                    THE {impostorNames.length > 1 ? 'IMPOSTORS WERE' : 'IMPOSTOR WAS'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bangers tracking-wider text-rose-950 uppercase">
                    {impostorNames.join(', ')}
                  </div>
                </div>

                {/* Secret Character Reveal */}
                <div className="w-full p-4 bg-white/90 border-2 border-white mb-5 flex flex-col items-center rounded-2xl shadow-sm">
                  <div className="text-[10px] font-comic font-bold text-black uppercase tracking-wider mb-2">
                    SECRET CHARACTER WAS
                  </div>
                  <div className="w-24 h-24 bg-amber-100 border-2 border-slate-200 rounded-2xl overflow-hidden mb-2">
                    <img
                      src={secretCharacter.imageUrl}
                      alt={secretCharacter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-base font-comic font-black text-black uppercase tracking-wider">
                    {secretCharacter.name}
                  </div>
                </div>

                {/* Home / Main Menu */}
                <button
                  type="button"
                  onClick={onHome}
                  className="w-full py-3.5 px-6 bg-teal-300 hover:bg-teal-200 text-black font-comic font-black text-xs uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
                >
                  Main Menu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

