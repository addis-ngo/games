import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Sparkles, AlertCircle, Home, X } from 'lucide-react';
import { Character, Player } from '../types';
import { getBidSettings } from '../utils/storage';

export interface BidRosterItem {
  character: Character;
  winningBid: number;
}

interface BidGameProps {
  characters: Character[];
  onPlayAgain: () => void;
  onHome: () => void;
}

export const BidGame: React.FC<BidGameProps> = ({
  characters,
  onHome,
}) => {
  // Load settings
  const bidSettings = getBidSettings();
  const p1Name = bidSettings.p1Name || 'Player 1';
  const p2Name = bidSettings.p2Name || 'Player 2';
  const p1PopChar = characters.find((c) => c.id === bidSettings.p1PopId);
  const p2PopChar = characters.find((c) => c.id === bidSettings.p2PopId);

  // Financial & Roster State
  const [p1Money, setP1Money] = useState<number>(20);
  const [p2Money, setP2Money] = useState<number>(20);
  const [p1Roster, setP1Roster] = useState<BidRosterItem[]>([]);
  const [p2Roster, setP2Roster] = useState<BidRosterItem[]>([]);

  // Auction State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [firstBidder, setFirstBidder] = useState<Player>('P1');
  const [currentTurn, setCurrentTurn] = useState<Player>('P1');
  const [currentHighBid, setCurrentHighBid] = useState<number>(0);
  const [currentHighBidder, setCurrentHighBidder] = useState<Player | null>(null);

  // Custom bid modal state
  const [showCustomBidModal, setShowCustomBidModal] = useState<boolean>(false);
  const [modalBidInput, setModalBidInput] = useState<number>(1);

  const [concededInCurrentRound, setConcededInCurrentRound] = useState<{ P1: boolean; P2: boolean }>({
    P1: false,
    P2: false,
  });

  // Animation & UI state
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [animatingWinner, setAnimatingWinner] = useState<{ winner: Player; character: Character; bid: number } | null>(null);

  const currentCharacter = characters[currentIndex];

  // Active turn player helper info
  const activeMoney = currentTurn === 'P1' ? p1Money : p2Money;
  const minRequiredBid = currentHighBid === 0 ? 1 : currentHighBid + 1;

  // Check game over condition
  useEffect(() => {
    if (p1Money === 0 && p2Money === 0) {
      setIsGameOver(true);
    }
  }, [p1Money, p2Money]);

  // Advance to next character
  const handleAdvanceToNextCharacter = (
    updatedP1Money = p1Money,
    updatedP2Money = p2Money,
    nextIdx = currentIndex + 1
  ) => {
    if (updatedP1Money === 0 && updatedP2Money === 0) {
      setIsGameOver(true);
      return;
    }

    let actualNextIdx = nextIdx;
    if (characters.length > 0 && actualNextIdx >= characters.length) {
      actualNextIdx = 0;
    }

    // Determine next first bidder (alternate)
    const nextFirst: Player = firstBidder === 'P1' ? 'P2' : 'P1';
    setFirstBidder(nextFirst);

    // If one player has no money, always start with the player with money
    let startingPlayer = nextFirst;
    if (updatedP1Money === 0 && updatedP2Money > 0) {
      startingPlayer = 'P2';
    } else if (updatedP2Money === 0 && updatedP1Money > 0) {
      startingPlayer = 'P1';
    }
    setCurrentTurn(startingPlayer);

    setCurrentIndex(nextIdx);
    setCurrentHighBid(0);
    setCurrentHighBidder(null);
    setConcededInCurrentRound({ P1: false, P2: false });
  };

  // Place a Bid
  const handlePlaceBid = (amount: number) => {
    if (amount < minRequiredBid || amount > activeMoney) return;

    setCurrentHighBid(amount);
    setCurrentHighBidder(currentTurn);

    const opponent: Player = currentTurn === 'P1' ? 'P2' : 'P1';

    // Switch turn to opponent so they can outbid or concede
    setCurrentTurn(opponent);
  };

  // Concede / Pass on current character
  const handleConcede = () => {
    if (animatingWinner) return;

    const active = currentTurn;
    const opponent: Player = active === 'P1' ? 'P2' : 'P1';
    const opponentMoney = opponent === 'P1' ? p1Money : p2Money;

    // Case 1: Someone already placed a high bid -> Winner claims character!
    if (currentHighBidder !== null) {
      const winner = currentHighBidder;
      const winningBid = currentHighBid;
      const char = currentCharacter;

      let newP1Money = p1Money;
      let newP2Money = p2Money;

      if (winner === 'P1') {
        newP1Money = p1Money - winningBid;
        setP1Money(newP1Money);
      } else {
        newP2Money = p2Money - winningBid;
        setP2Money(newP2Money);
      }

      const winnerLabel = winner === 'P1' ? p1Name : p2Name;
      setAnnouncement(`🎉 ${winnerLabel} won ${char.name} for $${winningBid}!`);

      // Trigger animation of character moving to winner's roster
      setAnimatingWinner({ winner, character: char, bid: winningBid });

      setTimeout(() => {
        if (winner === 'P1') {
          setP1Roster((prev) => [...prev, { character: char, winningBid }]);
        } else {
          setP2Roster((prev) => [...prev, { character: char, winningBid }]);
        }
        setAnimatingWinner(null);
        setAnnouncement(null);
        handleAdvanceToNextCharacter(newP1Money, newP2Money, currentIndex + 1);
      }, 1200);

      return;
    }

    // Case 2: No bids placed yet ($0 bid)
    const updatedConceded = { ...concededInCurrentRound, [active]: true };
    setConcededInCurrentRound(updatedConceded);

    // If opponent has not conceded yet, pass turn
    if (!updatedConceded[opponent]) {
      setCurrentTurn(opponent);
      return;
    }

    // Both players passed without bidding! Character goes unsold.
    setAnnouncement(`🚫 ${currentCharacter.name} went unsold.`);
    setTimeout(() => {
      setAnnouncement(null);
      handleAdvanceToNextCharacter(p1Money, p2Money, currentIndex + 1);
    }, 1200);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-white bg-blue-dot-grid text-slate-900 font-comic flex flex-col items-center justify-between p-2 sm:p-4 relative overflow-hidden select-none">
      {/* Top Banner Alert / Toast */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-3 z-50 bg-amber-400 border-4 border-white text-slate-950 font-black text-xs sm:text-sm px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 uppercase tracking-wide ring-4 ring-amber-300/50"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>{announcement}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM BID POPUP MODAL */}
      <AnimatePresence>
        {showCustomBidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-amber-400 p-4 sm:p-5 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm text-slate-950 font-comic flex flex-col items-center gap-3 relative"
            >
              <button
                type="button"
                onClick={() => setShowCustomBidModal(false)}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-lg sm:text-xl font-black uppercase text-indigo-950 flex items-center gap-2 mt-1">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <span>{currentTurn === 'P1' ? 'Player 1' : 'Player 2'} Custom Bid</span>
              </div>

              <div className="text-xs font-bold text-slate-600 text-center">
                Min Bid: <span className="text-emerald-600 font-black">${minRequiredBid}</span> | Max Available: <span className="text-blue-600 font-black">${activeMoney}</span>
              </div>

              {/* Counter Input */}
              <div className="flex items-center gap-2 w-full justify-center my-1">
                <button
                  type="button"
                  onClick={() => setModalBidInput((prev) => Math.max(minRequiredBid, prev - 1))}
                  className="w-10 h-10 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-900 font-black text-xl rounded-xl border border-slate-400 flex items-center justify-center cursor-pointer select-none"
                >
                  -
                </button>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg">$</span>
                  <input
                    type="number"
                    min={minRequiredBid}
                    max={activeMoney}
                    value={modalBidInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setModalBidInput(val);
                      else setModalBidInput(minRequiredBid);
                    }}
                    className="w-28 sm:w-32 py-2 pl-7 pr-2 text-center bg-slate-100 text-slate-950 font-black text-xl rounded-xl border-2 border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setModalBidInput((prev) => Math.min(activeMoney, prev + 1))}
                  className="w-10 h-10 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-900 font-black text-xl rounded-xl border border-slate-400 flex items-center justify-center cursor-pointer select-none"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomBidModal(false)}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase rounded-xl border border-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalAmt = Math.min(activeMoney, Math.max(minRequiredBid, modalBidInput));
                    handlePlaceBid(finalAmt);
                    setShowCustomBidModal(false);
                  }}
                  className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase rounded-xl border border-white shadow-md active:scale-95 cursor-pointer"
                >
                  Confirm Bid
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="w-full max-w-5xl h-full max-h-[calc(100dvh-1.5rem)] bg-[#a5b4fc]/90 backdrop-blur-xl px-2 sm:px-4 py-2 sm:py-3 shadow-[0_25px_60px_rgba(165,180,252,0.45)] border-4 border-white rounded-3xl flex flex-col items-center justify-between text-center relative z-10 ring-4 ring-indigo-300/50">
        
        {/* TOP BAR / HEADER */}
        <div className="w-full flex items-center justify-center shrink-0 mb-1 sm:mb-2 px-2 text-center">
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-bangers tracking-wider text-white uppercase transform -rotate-1 [-webkit-text-stroke:2px_black] drop-shadow-md">
            {isGameOver ? 'Auction Results' : 'Biddy Up'}
          </h1>
        </div>

        {/* ACTIVE SPLIT ARENA (BLUE LEFT vs RED RIGHT) */}
        {!isGameOver && currentCharacter && (
          <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between overflow-hidden">
            
            {/* The Main Dynamic Rectangle */}
            <div className="w-full flex-1 min-h-0 bg-slate-900 border-4 border-white rounded-2xl shadow-xl flex relative overflow-hidden my-1">
              
              {/* LEFT HALF: PLAYER 1 (BLUE SIDE) */}
              <motion.div
                initial={false}
                animate={{
                  flex: currentTurn === 'P1' ? 7 : 3,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className={`h-full bg-blue-600 p-2 sm:p-3 flex flex-col justify-between relative transition-colors duration-300 ${
                  currentTurn === 'P1' ? 'z-10' : 'opacity-85'
                }`}
              >
                {/* P1 Header Info */}
                <div className="flex items-center justify-between w-full border-b border-white/30 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    {p1PopChar ? (
                      <img
                        src={p1PopChar.imageUrl}
                        alt={p1Name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-800 text-white font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                        P1
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <div className="text-[10px] sm:text-xs font-black uppercase text-blue-100 tracking-wider truncate max-w-[85px] sm:max-w-[110px]">
                        {p1Name}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{p1Money}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* P1 Won Roster (Vertical side list along left edge going top to bottom) */}
                <div className="flex-1 my-2 overflow-y-auto pr-1 flex flex-col items-start gap-1 w-full">
                  <div className="text-[10px] font-black uppercase text-blue-100 tracking-wider mb-0.5">
                    Won ({p1Roster.length})
                  </div>
                  {p1Roster.length > 0 && (
                    <div className="flex flex-col gap-1.5 items-start w-full">
                      {p1Roster.map((item, idx) => (
                        <div
                          key={idx}
                          title={`${item.character.name} ($${item.winningBid})`}
                          className="relative group bg-blue-800/90 border border-white/50 rounded-lg p-1 pr-2 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer max-w-full"
                        >
                          <img
                            src={item.character.imageUrl}
                            alt={item.character.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-md shrink-0 border border-white/30"
                          />
                          <div className="text-left min-w-0">
                            <div className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[55px] sm:max-w-[75px]">
                              {item.character.name}
                            </div>
                            <div className="text-[8px] sm:text-[9px] font-black text-amber-300">
                              ${item.winningBid}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* P1 Controls */}
                {currentTurn === 'P1' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex flex-col gap-1.5 shrink-0"
                  >
                    <div className="grid grid-cols-2 gap-1.5 w-full">
                      {/* Direct Bid Button */}
                      <button
                        type="button"
                        disabled={p1Money < minRequiredBid}
                        onClick={() => handlePlaceBid(minRequiredBid)}
                        className="py-2.5 px-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase border-2 border-white rounded-xl shadow-xs active:scale-95 disabled:active:scale-100 cursor-pointer flex items-center justify-center truncate"
                      >
                        Bid ${minRequiredBid}
                      </button>

                      {/* Custom Bid Modal Trigger Button */}
                      <button
                        type="button"
                        disabled={p1Money < minRequiredBid}
                        onClick={() => {
                          if (p1Money >= minRequiredBid) {
                            setModalBidInput(minRequiredBid);
                            setShowCustomBidModal(true);
                          }
                        }}
                        className="py-2.5 px-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed text-white font-black text-xs uppercase border-2 border-white rounded-xl shadow-xs active:scale-95 disabled:active:scale-100 cursor-pointer flex items-center justify-center truncate"
                      >
                        Custom Bid
                      </button>
                    </div>

                    {/* Concede Button */}
                    <button
                      type="button"
                      onClick={handleConcede}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white rounded-xl shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {currentHighBidder !== null ? `Concede` : 'Pass'}
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* RIGHT HALF: PLAYER 2 (RED SIDE) */}
              <motion.div
                initial={false}
                animate={{
                  flex: currentTurn === 'P2' ? 7 : 3,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className={`h-full bg-red-600 p-2 sm:p-3 flex flex-col justify-between relative transition-colors duration-300 ${
                  currentTurn === 'P2' ? 'z-10' : 'opacity-85'
                }`}
              >
                {/* P2 Header Info */}
                <div className="flex items-center justify-between w-full border-b border-white/30 pb-1.5">
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="text-right min-w-0">
                      <div className="text-[10px] sm:text-xs font-black uppercase text-red-100 tracking-wider truncate max-w-[85px] sm:max-w-[110px]">
                        {p2Name}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-end gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{p2Money}</span>
                      </div>
                    </div>
                    {p2PopChar ? (
                      <img
                        src={p2PopChar.imageUrl}
                        alt={p2Name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-800 text-white font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                        P2
                      </div>
                    )}
                  </div>
                </div>

                {/* P2 Won Roster (Vertical side list along right edge going top to bottom) */}
                <div className="flex-1 my-2 overflow-y-auto pl-1 flex flex-col items-end gap-1 text-right w-full">
                  <div className="text-[10px] font-black uppercase text-red-100 tracking-wider mb-0.5">
                    Won ({p2Roster.length})
                  </div>
                  {p2Roster.length > 0 && (
                    <div className="flex flex-col gap-1.5 items-end w-full">
                      {p2Roster.map((item, idx) => (
                        <div
                          key={idx}
                          title={`${item.character.name} ($${item.winningBid})`}
                          className="relative group bg-red-800/90 border border-white/50 rounded-lg p-1 pl-2 flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer max-w-full flex-row-reverse"
                        >
                          <img
                            src={item.character.imageUrl}
                            alt={item.character.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded-md shrink-0 border border-white/30"
                          />
                          <div className="text-right min-w-0">
                            <div className="text-[9px] sm:text-[10px] font-black text-white truncate max-w-[55px] sm:max-w-[75px]">
                              {item.character.name}
                            </div>
                            <div className="text-[8px] sm:text-[9px] font-black text-amber-300">
                              ${item.winningBid}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* P2 Controls */}
                {currentTurn === 'P2' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full flex flex-col gap-1.5 shrink-0"
                  >
                    <div className="grid grid-cols-2 gap-1.5 w-full">
                      {/* Direct Bid Button */}
                      <button
                        type="button"
                        disabled={p2Money < minRequiredBid}
                        onClick={() => handlePlaceBid(minRequiredBid)}
                        className="py-2.5 px-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase border-2 border-white rounded-xl shadow-xs active:scale-95 disabled:active:scale-100 cursor-pointer flex items-center justify-center truncate"
                      >
                        Bid ${minRequiredBid}
                      </button>

                      {/* Custom Bid Modal Trigger Button */}
                      <button
                        type="button"
                        disabled={p2Money < minRequiredBid}
                        onClick={() => {
                          if (p2Money >= minRequiredBid) {
                            setModalBidInput(minRequiredBid);
                            setShowCustomBidModal(true);
                          }
                        }}
                        className="py-2.5 px-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed text-white font-black text-xs uppercase border-2 border-white rounded-xl shadow-xs active:scale-95 disabled:active:scale-100 cursor-pointer flex items-center justify-center truncate"
                      >
                        Custom Bid
                      </button>
                    </div>

                    {/* Concede Button */}
                    <button
                      type="button"
                      onClick={handleConcede}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-white rounded-xl shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {currentHighBidder !== null ? `Concede` : 'Pass'}
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* CENTER DISPLAY: CHARACTER BEING BID ON */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCharacter.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: animatingWinner ? (animatingWinner.winner === 'P1' ? -180 : 180) : 0,
                      rotate: animatingWinner ? (animatingWinner.winner === 'P1' ? -15 : 15) : 0,
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="bg-white border-4 border-amber-400 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-col items-center ring-4 ring-black/30 w-36 sm:w-44 text-slate-950"
                  >
                    {/* Clean Image Container */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-indigo-50 border-2 border-slate-900 rounded-xl overflow-hidden relative shadow-md mb-1 group">
                      <img
                        src={currentCharacter.imageUrl}
                        alt={currentCharacter.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Character Name & Category */}
                    <div className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider truncate max-w-full">
                      {currentCharacter.name}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200 mt-0.5">
                      {currentCharacter.category || currentCharacter.theme || 'Anime'}
                    </div>

                    {/* Highest Bid Badge */}
                    <div className="w-full mt-1.5 py-1 px-1.5 bg-slate-950 text-white border-2 border-amber-400 rounded-xl flex items-center justify-between text-[10px] sm:text-xs font-bold shadow-xs">
                      <span className="text-amber-300 uppercase flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3 text-amber-400" />
                        Bid:
                      </span>
                      {currentHighBid > 0 && currentHighBidder ? (
                        <span className={`font-black px-1.5 py-0.5 rounded truncate max-w-[90px] ${currentHighBidder === 'P1' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}`}>
                          ${currentHighBid} ({currentHighBidder === 'P1' ? p1Name : p2Name})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">$0</span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        )}

        {/* RESULTS SCREEN / SHOWCASE ROSTERS */}
        {isGameOver && (
          <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between my-1 overflow-hidden animate-in fade-in duration-300">
            {/* Split Rosters Grid */}
            <div className="w-full flex-1 min-h-0 grid grid-cols-2 gap-2 sm:gap-4 overflow-hidden mb-2">
              {/* Player 1 Roster Column */}
              <div className="bg-blue-600 border-2 border-white p-2 sm:p-3 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm text-white">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/30 mb-2">
                  <div className="text-xs font-black uppercase text-blue-100 truncate max-w-[120px]">{p1Name} Roster</div>
                  <div className="text-[10px] font-bold text-amber-300 bg-blue-800/80 px-2 py-0.5 rounded-full border border-white/30">
                    {p1Roster.length} Chars
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {p1Roster.length === 0 ? (
                    <div className="text-[11px] text-blue-200/70 italic py-6">No characters acquired</div>
                  ) : (
                    p1Roster.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-blue-700/80 border border-white/30 p-1.5 rounded-xl shadow-2xs"
                      >
                        <img
                          src={item.character.imageUrl}
                          alt={item.character.name}
                          className="w-8 h-8 rounded-lg object-cover border border-white/50 shrink-0"
                        />
                        <div className="text-left min-w-0 flex-1">
                          <div className="text-[11px] font-black uppercase text-white truncate">
                            {item.character.name}
                          </div>
                          <div className="text-[9px] font-bold text-amber-300">
                            Paid ${item.winningBid}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Player 2 Roster Column */}
              <div className="bg-red-600 border-2 border-white p-2 sm:p-3 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm text-white">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/30 mb-2">
                  <div className="text-xs font-black uppercase text-red-100 truncate max-w-[120px]">{p2Name} Roster</div>
                  <div className="text-[10px] font-bold text-amber-300 bg-red-800/80 px-2 py-0.5 rounded-full border border-white/30">
                    {p2Roster.length} Chars
                  </div>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {p2Roster.length === 0 ? (
                    <div className="text-[11px] text-red-200/70 italic py-6">No characters acquired</div>
                  ) : (
                    p2Roster.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-red-700/80 border border-white/30 p-1.5 rounded-xl shadow-2xs"
                      >
                        <img
                          src={item.character.imageUrl}
                          alt={item.character.name}
                          className="w-8 h-8 rounded-lg object-cover border border-white/50 shrink-0"
                        />
                        <div className="text-left min-w-0 flex-1">
                          <div className="text-[11px] font-black uppercase text-white truncate">
                            {item.character.name}
                          </div>
                          <div className="text-[9px] font-bold text-amber-300">
                            Paid ${item.winningBid}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action (Only Main Menu button, Play Again removed per user instruction) */}
            <div className="w-full flex justify-center shrink-0">
              <button
                type="button"
                onClick={onHome}
                className="w-full py-3 px-6 bg-teal-300 hover:bg-teal-200 text-slate-950 font-black text-sm uppercase border-2 border-white rounded-xl shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
