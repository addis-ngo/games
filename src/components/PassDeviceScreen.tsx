import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Character, Player } from '../types';
import { getGuessWhoSettings } from '../utils/storage';
import player1Logo from '../assets/images/player1_logo_1785281331067.jpg';
import player2Logo from '../assets/images/player2_logo_1785281340728.jpg';

interface PassDeviceScreenProps {
  player: Player;
  onReady: () => void;
  title?: string;
  subtext?: string;
  characters?: Character[];
}

export const PassDeviceScreen: React.FC<PassDeviceScreenProps> = ({
  player,
  onReady,
  title,
  subtext,
  characters = [],
}) => {
  const gwSettings = getGuessWhoSettings();
  const p1Name = gwSettings.p1Name || 'Player 1';
  const p2Name = gwSettings.p2Name || 'Player 2';
  const playerLabel = player === 'P1' ? p1Name : p2Name;
  const otherLabel = player === 'P1' ? p2Name : p1Name;

  const popId = player === 'P1' ? gwSettings.p1PopId : gwSettings.p2PopId;
  const popChar = characters.find((c) => c.id === popId);

  const isP1 = player === 'P1';
  const bgClass = isP1 ? 'bg-blue-700' : 'bg-red-700';
  const playerLogo = popChar ? popChar.imageUrl : (isP1 ? player1Logo : player2Logo);

  return (
    <div className={`min-h-screen ${bgClass} text-white flex flex-col items-center justify-center p-6 select-none transition-colors duration-300`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-sm flex flex-col items-center text-center font-comic"
      >
        {/* Badge / Avatar Logo */}
        <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white flex items-center justify-center mb-6 shadow-lg overflow-hidden">
          <img
            src={playerLogo}
            alt={playerLabel}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className="text-2xl font-bangers tracking-wide uppercase mb-2">
          {title || `Pass device to ${playerLabel}`}
        </h2>

        <p className="text-xs font-comic text-white/80 mb-8 max-w-xs">
          {subtext || `Make sure ${otherLabel} is not looking at the screen.`}
        </p>

        <button
          onClick={onReady}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-comic font-bold text-sm uppercase flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg border-2 border-amber-200 cursor-pointer"
        >
          I am {playerLabel}
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </motion.div>
    </div>
  );
};
