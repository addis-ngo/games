import React, { useState } from 'react';
import { motion } from 'motion/react';
import { QuestionPair } from '../types';

export interface QuestionImpostorPlayer {
  playerName: string;
  isImpostor: boolean;
  questionReceived: string;
}

interface QuestionImpostorGameProps {
  questionPair: QuestionPair;
  mainQuestion: string;
  impostorQuestion: string;
  playerRoles: QuestionImpostorPlayer[];
  impostorNames: string[];
  onHome: () => void;
}

export const QuestionImpostorGame: React.FC<QuestionImpostorGameProps> = ({
  questionPair,
  mainQuestion,
  impostorQuestion,
  playerRoles,
  impostorNames,
  onHome,
}) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [phase, setPhase] = useState<'PASS' | 'ANSWER' | 'DISCUSSION'>('PASS');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<
    { playerName: string; answer: string; isImpostor: boolean; questionReceived: string }[]
  >([]);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = playerRoles[currentPlayerIndex];

  const handleStartAnswer = () => {
    setPhase('ANSWER');
    setCurrentAnswer('');
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAnswer = currentAnswer.trim() || 'No Answer';

    setSubmittedAnswers((prev) => [
      ...prev,
      {
        playerName: currentPlayer.playerName,
        answer: finalAnswer,
        isImpostor: currentPlayer.isImpostor,
        questionReceived: currentPlayer.questionReceived,
      },
    ]);

    if (currentPlayerIndex < playerRoles.length - 1) {
      setCurrentPlayerIndex((prev) => prev + 1);
      setPhase('PASS');
      setCurrentAnswer('');
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
                Player {currentPlayerIndex + 1} of {playerRoles.length}
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
              onClick={handleStartAnswer}
              className="w-full py-3.5 px-6 bg-amber-300 hover:bg-amber-200 text-black font-comic font-black text-sm uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
            >
              View My Question
            </button>
          </motion.div>
        )}

        {/* PHASE 2: ANSWER QUESTION */}
        {phase === 'ANSWER' && (
          <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-2">
              <span className="font-comic font-black text-xs text-black bg-indigo-200 px-3.5 py-1 border-2 border-white rounded-full uppercase tracking-wider shadow-sm">
                {currentPlayer.playerName}&apos;s Question
              </span>
            </div>

            <div className="w-full bg-white/95 backdrop-blur-md border-2 border-white p-4 mb-4 text-left shadow-sm rounded-2xl">
              <div className="text-[10px] font-comic font-bold text-black uppercase tracking-wider mb-1">
                SECRET QUESTION:
              </div>
              <div className="text-base sm:text-lg font-comic font-black text-black leading-snug">
                {currentPlayer.questionReceived}
              </div>
            </div>

            <div className="w-full text-left mb-5">
              <label className="block text-xs font-comic font-bold text-black uppercase tracking-wider mb-1.5">
                Your Answer:
              </label>
              <textarea
                rows={3}
                required
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-white border-2 border-indigo-200 focus:border-amber-400 p-3 text-sm font-comic font-bold text-black placeholder-slate-400 focus:outline-none rounded-2xl resize-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-amber-300 hover:bg-amber-200 text-black font-comic font-black text-xs uppercase tracking-wider transition-all border-2 border-white rounded-2xl shadow-md cursor-pointer active:scale-[0.98]"
            >
              Submit & Pass Device
            </button>
          </form>
        )}

        {/* PHASE 3: DISCUSSION & REVEAL */}
        {phase === 'DISCUSSION' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl sm:text-4xl font-bangers tracking-wider text-white uppercase mb-2 [-webkit-text-stroke:2.5px_black]">
              Discussion Time
            </h2>

            <p className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-3 leading-relaxed">
              Here are everyone&apos;s answers. Discuss and guess who had the secret alternate question!
            </p>

            {/* Real Question Display */}
            <div className="w-full bg-white/95 backdrop-blur-md border-2 border-white p-3.5 mb-4 text-left shadow-sm rounded-2xl">
              <div className="text-[10px] font-comic font-bold text-black uppercase tracking-wider mb-0.5">
                REAL QUESTION:
              </div>
              <div className="text-sm sm:text-base font-comic font-black text-black leading-snug">
                {mainQuestion}
              </div>
            </div>

            {/* Answers List */}
            <div className="w-full space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
              {submittedAnswers.map((item, idx) => {
                const isThisImpostor = isRevealed && item.isImpostor;

                return (
                  <div
                    key={idx}
                    className={`w-full p-3 border-2 border-white text-left transition-all rounded-2xl shadow-sm ${
                      isThisImpostor
                        ? 'bg-rose-200/95 text-black'
                        : 'bg-white/95 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-comic font-black text-xs uppercase tracking-wider text-black">
                        {item.playerName}
                      </span>
                      {isThisImpostor && (
                        <span className="text-[10px] font-comic font-bold text-black uppercase bg-rose-300 px-2.5 py-0.5 rounded-full border border-white">
                          IMPOSTOR
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-comic font-bold text-black bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
                      &ldquo;{item.answer}&rdquo;
                    </div>
                  </div>
                );
              })}
            </div>

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
                {/* Impostor Reveal Banner */}
                <div className="w-full p-4 bg-rose-200 border-2 border-white mb-4 text-center shadow-sm rounded-2xl">
                  <div className="text-xs font-comic font-bold text-black uppercase tracking-wider mb-0.5">
                    THE {impostorNames.length > 1 ? 'IMPOSTORS WERE' : 'IMPOSTOR WAS'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bangers tracking-wider text-rose-950 uppercase">
                    {impostorNames.join(', ')}
                  </div>
                </div>

                {/* Questions Comparison Box */}
                <div className="w-full p-3.5 bg-white/95 border-2 border-white mb-5 rounded-2xl text-left space-y-2 shadow-sm">
                  <div>
                    <span className="text-[10px] font-comic font-bold text-black uppercase tracking-wider block">
                      Main Question (Everyone Else):
                    </span>
                    <span className="text-xs font-comic font-bold text-black">
                      {mainQuestion}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-comic font-bold text-black uppercase tracking-wider block">
                      Impostor Question:
                    </span>
                    <span className="text-xs font-comic font-bold text-black">
                      {impostorQuestion}
                    </span>
                  </div>
                </div>

                {/* Main Menu Button */}
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

