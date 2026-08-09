import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Character } from '../types';
import { getLibrary } from '../utils/storage';

interface FloatingBubblesBackgroundProps {
  characters?: Character[];
  isFadingOut?: boolean;
}

const COLOR_PALETTE = [
  'bg-pink-400',
  'bg-cyan-400',
  'bg-purple-500',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-fuchsia-500',
  'bg-sky-400',
  'bg-indigo-500',
  'bg-lime-400',
  'bg-rose-400',
  'bg-orange-400',
  'bg-violet-400',
  'bg-teal-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-blue-500',
];

interface SingleBubbleProps {
  slotIndex: number;
  initialDelay: number;
  characters: Character[];
}

const SingleBubble: React.FC<SingleBubbleProps> = ({ slotIndex, initialDelay, characters }) => {
  const [cycle, setCycle] = useState(0);

  const charsHash = useMemo(() => characters.map((c) => c.id).join(','), [characters]);

  // Generate fresh random properties every cycle (new character, size, color, trajectory)
  const bubbleState = useMemo(() => {
    // Pick completely random character from active list
    const randomChar =
      characters && characters.length > 0
        ? characters[Math.floor(Math.random() * characters.length)]
        : null;

    // Pick random bubble size (65px to 220px)
    const randomSize = Math.floor(Math.random() * 155) + 65;

    // Pick random solid opaque color
    const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    // Off-screen bottom spawn across screen width (2% to 92%)
    const startLeft = `${Math.floor(Math.random() * 90) + 2}%`;
    const startTop = `${Math.floor(Math.random() * 20) + 108}%`; // 108% to 128% off-screen bottom

    // Slight horizontal drift/sway as it rises
    const driftX = `${Math.floor(Math.random() * 60) - 30}px`; // -30px to +30px

    // Rise far past the top of screen completely (-220vh to -250vh) so even dragged bubbles float off-screen
    const deltaY = `-${Math.floor(Math.random() * 30) + 220}vh`;

    // Speed duration
    const duration = Math.floor(Math.random() * 8) + 12; // 12s to 20s

    return {
      character: randomChar,
      size: randomSize,
      color: randomColor,
      startLeft,
      startTop,
      driftX,
      deltaY,
      duration,
    };
  }, [cycle, charsHash]);

  return (
    <motion.div
      key={`${slotIndex}-${cycle}`}
      initial={{
        x: '0px',
        y: '0vh',
      }}
      animate={{
        x: ['0px', bubbleState.driftX],
        y: ['0vh', bubbleState.deltaY],
      }}
      transition={{
        duration: bubbleState.duration,
        ease: 'linear',
        delay: cycle === 0 ? initialDelay : 0,
      }}
      onAnimationComplete={() => {
        setCycle((c) => c + 1);
      }}
      style={{
        width: `${bubbleState.size}px`,
        height: `${bubbleState.size}px`,
        left: bubbleState.startLeft,
        top: bubbleState.startTop,
      }}
      className="absolute pointer-events-auto select-none z-10"
    >
      <motion.div
        drag
        dragConstraints={{ left: -600, right: 600, top: -1200, bottom: 1200 }}
        dragElastic={0.2}
        whileHover={{ scale: 1.06 }}
        whileDrag={{ scale: 1.15, zIndex: 50 }}
        className={`w-full h-full rounded-full ${bubbleState.color} overflow-hidden flex items-center justify-center shadow-lg border-2 border-white/90 p-0.5 cursor-grab active:cursor-grabbing relative transition-shadow hover:shadow-xl`}
      >
        {bubbleState.character && (
          <img
            src={bubbleState.character.imageUrl}
            alt={bubbleState.character.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full pointer-events-none select-none"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export const FloatingBubblesBackground: React.FC<FloatingBubblesBackgroundProps> = ({
  characters: propCharacters,
  isFadingOut = false,
}) => {
  const [activeCharacters, setActiveCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (propCharacters && propCharacters.length > 0) {
      const active = propCharacters.filter((c) => !c.excluded);
      setActiveCharacters(active.length > 0 ? active : propCharacters);
    } else {
      const lib = getLibrary();
      const active = lib.filter((c) => !c.excluded);
      setActiveCharacters(active.length > 0 ? active : lib);
    }
  }, [propCharacters]);

  // 25 staggered spawn slots continuously generating rising bubbles
  const slots = useMemo(() => {
    return Array.from({ length: 25 }, (_, idx) => ({
      slotIndex: idx,
      initialDelay: idx * 0.65, // 0s, 0.65s, 1.3s, 1.95s, etc.
    }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isFadingOut ? 0 : 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{ willChange: 'opacity' }}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* Continuously spawning opaque bubbles rising straight up from the bottom */}
      {activeCharacters.length > 0 &&
        slots.map((slot) => (
          <SingleBubble
            key={slot.slotIndex}
            slotIndex={slot.slotIndex}
            initialDelay={slot.initialDelay}
            characters={activeCharacters}
          />
        ))}
    </motion.div>
  );
};
