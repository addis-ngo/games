import React, { useState, useMemo, useEffect } from 'react';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Character, ImpostorSettings, GuessWhoSettings, BidSettings } from '../types';
import { getImpostorSettings, saveImpostorSettings, getGuessWhoSettings, saveGuessWhoSettings, getBidSettings, saveBidSettings } from '../utils/storage';
import { FloatingBubblesBackground } from './FloatingBubblesBackground';
import { MENU_TITLES } from '../data/menuTitles';

interface MainScreenProps {
  onPlay: (selectedCategories?: string[]) => void;
  onPlayCharacterImpostor: (selectedCategories?: string[]) => void;
  onPlayQuestionImpostor: () => void;
  onPlayBlindRank: (selectedCategories?: string[]) => void;
  onPlayBid: (selectedCategories?: string[]) => void;
  onOpenLibrary: () => void;
  characters: Character[];
}

export const MainScreen: React.FC<MainScreenProps> = ({
  onPlay,
  onPlayCharacterImpostor,
  onPlayQuestionImpostor,
  onPlayBlindRank,
  onPlayBid,
  onOpenLibrary,
  characters,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'POOL' | 'GUESS_WHO' | 'BIDDY_UP' | 'IMPOSTOR'>('POOL');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Impostor settings state
  const [impostorSettings, setImpostorSettings] = useState<ImpostorSettings>(getImpostorSettings);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Guess Who settings state
  const [guessWhoSettings, setGuessWhoSettings] = useState<GuessWhoSettings>(getGuessWhoSettings);

  // Bid settings state
  const [bidSettings, setBidSettings] = useState<BidSettings>(getBidSettings);

  // Pop Avatar Picker state
  const [popPickerTarget, setPopPickerTarget] = useState<'GUESS_WHO_P1' | 'GUESS_WHO_P2' | 'BID_P1' | 'BID_P2' | null>(null);
  const [popSearch, setPopSearch] = useState('');

  // Random title selection on home screen load
  const [titleIndex] = useState(() => {
    if (!MENU_TITLES || MENU_TITLES.length === 0) return 0;
    return Math.floor(Math.random() * MENU_TITLES.length);
  });

  // Load settings when opening settings modal
  useEffect(() => {
    if (isSettingsOpen) {
      setImpostorSettings(getImpostorSettings());
      setGuessWhoSettings(getGuessWhoSettings());
      setBidSettings(getBidSettings());
    }
  }, [isSettingsOpen]);

  const handleUpdateGuessWhoSettings = (updated: GuessWhoSettings) => {
    setGuessWhoSettings(updated);
    saveGuessWhoSettings(updated);
  };

  const handleUpdateBidSettings = (updated: BidSettings) => {
    setBidSettings(updated);
    saveBidSettings(updated);
  };

  const handleSelectPop = (charId: string | null) => {
    if (popPickerTarget === 'GUESS_WHO_P1') {
      handleUpdateGuessWhoSettings({ ...guessWhoSettings, p1PopId: charId });
    } else if (popPickerTarget === 'GUESS_WHO_P2') {
      handleUpdateGuessWhoSettings({ ...guessWhoSettings, p2PopId: charId });
    } else if (popPickerTarget === 'BID_P1') {
      handleUpdateBidSettings({ ...bidSettings, p1PopId: charId });
    } else if (popPickerTarget === 'BID_P2') {
      handleUpdateBidSettings({ ...bidSettings, p2PopId: charId });
    }
    setPopPickerTarget(null);
    setPopSearch('');
  };

  const gwP1Pop = characters.find((c) => c.id === guessWhoSettings.p1PopId);
  const gwP2Pop = characters.find((c) => c.id === guessWhoSettings.p2PopId);
  const bidP1Pop = characters.find((c) => c.id === bidSettings.p1PopId);
  const bidP2Pop = characters.find((c) => c.id === bidSettings.p2PopId);

  const filteredPopCharacters = useMemo(() => {
    if (!popSearch.trim()) return characters;
    const q = popSearch.toLowerCase();
    return characters.filter((c) => c.name.toLowerCase().includes(q) || (c.category || c.theme || '').toLowerCase().includes(q));
  }, [characters, popSearch]);

  const handleUpdateImpostorSettings = (updated: ImpostorSettings) => {
    setImpostorSettings(updated);
    saveImpostorSettings(updated);
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim() || `Player ${impostorSettings.players.length + 1}`;
    const updatedPlayers = [...impostorSettings.players, name];
    setNewPlayerName('');
    handleUpdateImpostorSettings({
      ...impostorSettings,
      players: updatedPlayers,
    });
  };

  const handleRemovePlayer = (index: number) => {
    if (impostorSettings.players.length <= 2) return; // Keep at least 2 players
    const updatedPlayers = impostorSettings.players.filter((_, i) => i !== index);
    const newImpostorCount = Math.min(impostorSettings.impostorCount, updatedPlayers.length - 1);
    handleUpdateImpostorSettings({
      players: updatedPlayers,
      impostorCount: Math.max(1, newImpostorCount),
    });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const updatedPlayers = [...impostorSettings.players];
    updatedPlayers[index] = name;
    handleUpdateImpostorSettings({
      ...impostorSettings,
      players: updatedPlayers,
    });
  };

  // Extract all unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    characters.forEach((c) => {
      const cat = c.category || c.theme;
      if (cat) cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [characters]);

  // Selected categories state for the game pool (empty array = ALL)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Count active eligible characters in selected categories
  const eligibleCharactersCount = useMemo(() => {
    const active = characters.filter((c) => !c.excluded);
    if (selectedCategories.length === 0) return active.length;
    const selectedSet = new Set(selectedCategories.map((c) => c.toLowerCase()));
    return active.filter((c) => {
      const cat = (c.category || c.theme || 'General').toLowerCase();
      return selectedSet.has(cat);
    }).length;
  }, [characters, selectedCategories]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      const updated = selectedCategories.filter((c) => c !== cat);
      setSelectedCategories(updated);
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSelectAll = () => {
    setSelectedCategories([]);
  };

  const handlePlayGame = () => {
    onPlay(selectedCategories.length > 0 ? selectedCategories : undefined);
  };

  const handleGameStartWithAnimation = (action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
    }, 650);
  };

  return (
    <div className="min-h-screen bg-white bg-blue-dot-grid flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Floating Colored Bubbles Background on White Canvas */}
      <FloatingBubblesBackground characters={characters} isFadingOut={isTransitioning} />

      {/* Main console card box over floating bubbles background */}
      <motion.div
        initial={{
          borderRadius: '6% 6% 6% 6% / 6% 6% 6% 6%',
          scale: 1.04,
        }}
        animate={{
          borderRadius: isTransitioning
            ? '6% 6% 6% 6% / 6% 6% 6% 6%'
            : '55% 45% 62% 38% / 38% 62% 38% 62%',
          scale: isTransitioning ? 1.06 : 1,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full max-w-md sm:max-w-lg bg-[#a5b4fc]/95 backdrop-blur-xl px-10 sm:px-14 py-9 shadow-[0_25px_60px_rgba(165,180,252,0.45)] border-4 border-white flex flex-col items-center text-center relative z-10 ring-4 ring-indigo-300/50"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{
            duration: isTransitioning ? 0.25 : 0.45,
            delay: isTransitioning ? 0 : 0.15,
          }}
          className="w-full flex flex-col items-center"
        >
          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bangers tracking-wider text-white uppercase -mt-12 sm:-mt-14 mb-4 transform -rotate-2 hover:scale-105 transition-transform duration-300 [-webkit-text-stroke:2.5px_black] whitespace-nowrap z-20 px-2 pointer-events-auto">
            {MENU_TITLES[titleIndex % (MENU_TITLES.length || 1)] || 'ichigobankai'}
          </h1>

          {/* Main Games and Library / Settings Grid */}
          <div className="w-full max-w-[330px] sm:max-w-[370px] space-y-3">
            {/* 1. Guess Who */}
            <button
              type="button"
              onClick={() => handleGameStartWithAnimation(handlePlayGame)}
              className="w-full py-3 px-5 bg-amber-300 hover:bg-amber-200 text-black font-comic font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer group border-2 border-white"
              style={{
                borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%',
              }}
            >
              <span className="font-comic font-black text-black tracking-wider">Guess Who</span>
            </button>

            {/* 2. Impostor Games (Header above Character & Question) */}
            <div
              className="w-full flex flex-col gap-1.5 p-3 bg-white/80 backdrop-blur-md border-2 border-white/90 shadow-sm"
              style={{
                borderRadius: '45% 55% 60% 40% / 50% 45% 55% 50%',
              }}
            >
              <div className="flex items-center justify-center px-1 mb-0.5">
                <span className="font-comic font-extrabold text-[11px] tracking-widest text-black uppercase">
                  Impostor
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => handleGameStartWithAnimation(() => onPlayCharacterImpostor(selectedCategories))}
                  className="py-2.5 px-2 bg-purple-300/90 hover:bg-purple-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-all border-2 border-white shadow-sm active:scale-[0.98] cursor-pointer text-center"
                  style={{
                    borderRadius: '50% 50% 65% 35% / 40% 60% 40% 60%',
                  }}
                >
                  Character
                </button>

                <button
                  type="button"
                  onClick={() => handleGameStartWithAnimation(onPlayQuestionImpostor)}
                  className="py-2.5 px-2 bg-sky-300/90 hover:bg-sky-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase transition-all border-2 border-white shadow-sm active:scale-[0.98] cursor-pointer text-center"
                  style={{
                    borderRadius: '65% 35% 45% 55% / 55% 45% 55% 45%',
                  }}
                >
                  Question
                </button>
              </div>
            </div>

            {/* 3. Blind Rank & Bid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => handleGameStartWithAnimation(() => onPlayBlindRank(selectedCategories))}
                className="py-2.5 px-2 bg-emerald-300/90 hover:bg-emerald-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group"
                style={{
                  borderRadius: '40% 60% 50% 50% / 60% 40% 60% 40%',
                }}
              >
                <span className="font-comic font-extrabold text-black tracking-wider">Blind Rank</span>
              </button>

              <button
                type="button"
                onClick={() => handleGameStartWithAnimation(() => onPlayBid(selectedCategories))}
                className="py-2.5 px-2 bg-amber-400 hover:bg-amber-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group"
                style={{
                  borderRadius: '60% 40% 45% 55% / 50% 50% 60% 40%',
                }}
              >
                <span className="font-comic font-extrabold text-black tracking-wider">Biddy Up</span>
              </button>
            </div>

            {/* Bottom Row: 4. Character Library (Left Half) & Settings (Right Half) */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button
                type="button"
                onClick={() => handleGameStartWithAnimation(onOpenLibrary)}
                className="py-2.5 px-3 bg-teal-300/90 hover:bg-teal-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group"
                style={{
                  borderRadius: '55% 45% 60% 40% / 45% 55% 45% 55%',
                }}
              >
                <span className="truncate font-comic text-black">Library</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="py-2.5 px-3 bg-fuchsia-300/90 hover:bg-fuchsia-300 text-black font-comic font-bold text-[11px] sm:text-xs tracking-wider uppercase flex items-center justify-center transition-all border-2 border-white shadow-md active:scale-[0.98] cursor-pointer group relative"
                style={{
                  borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%',
                }}
              >
                <span className="truncate font-comic text-black">Settings</span>
                {selectedCategories.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 ring-2 ring-white animate-pulse rounded-full" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Settings Modal Popup */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#a5b4fc]/95 backdrop-blur-xl w-full max-w-sm sm:max-w-md border-4 border-white shadow-[0_25px_60px_rgba(165,180,252,0.5)] rounded-3xl p-5 sm:p-6 flex flex-col text-left animate-in zoom-in-95 duration-150 relative text-slate-900 ring-4 ring-indigo-300/50 font-comic">
            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-indigo-200/80">
              <div>
                <h2 className="text-xl font-comic font-black text-slate-900 tracking-wide uppercase">Console Settings</h2>
                <p className="text-xs font-comic font-bold text-indigo-900/80">Configure pools & players</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full text-indigo-950 hover:bg-white/80 bg-white/50 border-2 border-white shadow-xs transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Sub-Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-indigo-900/10 p-1 mb-4 border-2 border-white/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setSettingsTab('POOL')}
                className={`py-1.5 px-1 text-[11px] font-comic font-bold uppercase transition-all rounded-xl truncate ${
                  settingsTab === 'POOL'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border-2 border-amber-300'
                    : 'bg-white/60 text-indigo-900 hover:bg-white border border-white/60'
                }`}
              >
                Pool
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('GUESS_WHO')}
                className={`py-1.5 px-1 text-[11px] font-comic font-bold uppercase transition-all rounded-xl truncate ${
                  settingsTab === 'GUESS_WHO'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border-2 border-amber-300'
                    : 'bg-white/60 text-indigo-900 hover:bg-white border border-white/60'
                }`}
              >
                Guess Who
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('BIDDY_UP')}
                className={`py-1.5 px-1 text-[11px] font-comic font-bold uppercase transition-all rounded-xl truncate ${
                  settingsTab === 'BIDDY_UP'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border-2 border-amber-300'
                    : 'bg-white/60 text-indigo-900 hover:bg-white border border-white/60'
                }`}
              >
                Biddy Up
              </button>
              <button
                type="button"
                onClick={() => setSettingsTab('IMPOSTOR')}
                className={`py-1.5 px-1 text-[11px] font-comic font-bold uppercase transition-all rounded-xl truncate ${
                  settingsTab === 'IMPOSTOR'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border-2 border-amber-300'
                    : 'bg-white/60 text-indigo-900 hover:bg-white border border-white/60'
                }`}
              >
                Impostor
              </button>
            </div>

            {/* TAB 1: GAME POOL CATEGORIES */}
            {settingsTab === 'POOL' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-comic font-bold text-indigo-950 uppercase tracking-wider">Categories</span>
                  <span className="text-xs font-comic font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                    {eligibleCharactersCount} Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto p-2 border-2 border-white bg-white/60 rounded-2xl shadow-inner">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className={`px-3 py-1.5 rounded-xl text-xs font-comic font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                      selectedCategories.length === 0
                        ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs'
                        : 'bg-white/80 text-slate-700 hover:bg-white border-2 border-slate-200'
                    }`}
                  >
                    {selectedCategories.length === 0 && <Check className="w-3.5 h-3.5 text-slate-950" />}
                    All ({characters.filter((c) => !c.excluded).length})
                  </button>

                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    const catActiveCount = characters.filter(
                      (c) => !c.excluded && (c.category || c.theme || '').toLowerCase() === cat.toLowerCase()
                    ).length;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-comic font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer uppercase ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs'
                            : 'bg-white/80 text-slate-700 hover:bg-white border-2 border-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950" />}
                        {cat} ({catActiveCount})
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-comic font-bold text-indigo-900/80 mt-2.5 leading-relaxed">
                  {selectedCategories.length === 0
                    ? 'Currently using all active characters in library.'
                    : `Filtered to: ${selectedCategories.join(', ')}.`}
                </p>
              </div>
            )}

            {/* TAB 2: GUESS WHO SETTINGS */}
            {settingsTab === 'GUESS_WHO' && (
              <div className="mb-4 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {/* Random Secret Character Toggle */}
                <div className="bg-white/80 border-2 border-white p-3 rounded-2xl shadow-xs flex items-center justify-between gap-3">
                  <div className="flex-1 text-left">
                    <div className="text-xs font-comic font-bold text-slate-900 uppercase tracking-wide">
                      Random Secret Character
                    </div>
                    <div className="text-[11px] font-comic text-slate-600 leading-snug mt-0.5">
                      Assign secret characters automatically.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateGuessWhoSettings({
                        ...guessWhoSettings,
                        randomSecretCharacter: !guessWhoSettings.randomSecretCharacter,
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 p-0.5 ${
                      guessWhoSettings.randomSecretCharacter ? 'bg-amber-400 border-2 border-amber-500' : 'bg-slate-300 border-2 border-slate-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                        guessWhoSettings.randomSecretCharacter ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Player 1 Settings */}
                <div className="bg-white/80 border-2 border-white p-2.5 rounded-2xl shadow-xs space-y-2">
                  <div className="text-xs font-comic font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                    <span>Player 1</span>
                    <span className="text-[10px] font-comic font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">Blue Side</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={guessWhoSettings.p1Name || ''}
                      onChange={(e) => handleUpdateGuessWhoSettings({ ...guessWhoSettings, p1Name: e.target.value })}
                      placeholder="Player 1"
                      className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-400 px-2.5 py-1 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Pop Avatar
                    </label>
                    <div className="flex items-center gap-2 bg-white p-1.5 border-2 border-indigo-100 rounded-xl">
                      {gwP1Pop ? (
                        <img
                          src={gwP1Pop.imageUrl}
                          alt={gwP1Pop.name}
                          className="w-8 h-8 object-cover rounded-lg border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                          P1
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-comic font-bold text-slate-900 truncate">
                          {gwP1Pop ? gwP1Pop.name : 'Default Avatar'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopPickerTarget('GUESS_WHO_P1')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-comic font-bold text-[10px] uppercase rounded-lg cursor-pointer shrink-0"
                      >
                        {gwP1Pop ? 'Change' : 'Select'}
                      </button>
                      {gwP1Pop && (
                        <button
                          type="button"
                          onClick={() => handleUpdateGuessWhoSettings({ ...guessWhoSettings, p1PopId: null })}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                          title="Clear Pop Avatar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player 2 Settings */}
                <div className="bg-white/80 border-2 border-white p-2.5 rounded-2xl shadow-xs space-y-2">
                  <div className="text-xs font-comic font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                    <span>Player 2</span>
                    <span className="text-[10px] font-comic font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">Red Side</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={guessWhoSettings.p2Name || ''}
                      onChange={(e) => handleUpdateGuessWhoSettings({ ...guessWhoSettings, p2Name: e.target.value })}
                      placeholder="Player 2"
                      className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-400 px-2.5 py-1 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Pop Avatar
                    </label>
                    <div className="flex items-center gap-2 bg-white p-1.5 border-2 border-indigo-100 rounded-xl">
                      {gwP2Pop ? (
                        <img
                          src={gwP2Pop.imageUrl}
                          alt={gwP2Pop.name}
                          className="w-8 h-8 object-cover rounded-lg border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                          P2
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-comic font-bold text-slate-900 truncate">
                          {gwP2Pop ? gwP2Pop.name : 'Default Avatar'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopPickerTarget('GUESS_WHO_P2')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-comic font-bold text-[10px] uppercase rounded-lg cursor-pointer shrink-0"
                      >
                        {gwP2Pop ? 'Change' : 'Select'}
                      </button>
                      {gwP2Pop && (
                        <button
                          type="button"
                          onClick={() => handleUpdateGuessWhoSettings({ ...guessWhoSettings, p2PopId: null })}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                          title="Clear Pop Avatar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BIDDY UP SETTINGS */}
            {settingsTab === 'BIDDY_UP' && (
              <div className="mb-4 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {/* Player 1 Settings */}
                <div className="bg-white/80 border-2 border-white p-2.5 rounded-2xl shadow-xs space-y-2">
                  <div className="text-xs font-comic font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                    <span>Player 1</span>
                    <span className="text-[10px] font-comic font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">Blue Side</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={bidSettings.p1Name || ''}
                      onChange={(e) => handleUpdateBidSettings({ ...bidSettings, p1Name: e.target.value })}
                      placeholder="Player 1"
                      className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-400 px-2.5 py-1 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Pop Avatar
                    </label>
                    <div className="flex items-center gap-2 bg-white p-1.5 border-2 border-indigo-100 rounded-xl">
                      {bidP1Pop ? (
                        <img
                          src={bidP1Pop.imageUrl}
                          alt={bidP1Pop.name}
                          className="w-8 h-8 object-cover rounded-lg border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                          P1
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-comic font-bold text-slate-900 truncate">
                          {bidP1Pop ? bidP1Pop.name : 'Default Avatar'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopPickerTarget('BID_P1')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-comic font-bold text-[10px] uppercase rounded-lg cursor-pointer shrink-0"
                      >
                        {bidP1Pop ? 'Change' : 'Select'}
                      </button>
                      {bidP1Pop && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBidSettings({ ...bidSettings, p1PopId: null })}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                          title="Clear Pop Avatar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player 2 Settings */}
                <div className="bg-white/80 border-2 border-white p-2.5 rounded-2xl shadow-xs space-y-2">
                  <div className="text-xs font-comic font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                    <span>Player 2</span>
                    <span className="text-[10px] font-comic font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">Red Side</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Name
                    </label>
                    <input
                      type="text"
                      value={bidSettings.p2Name || ''}
                      onChange={(e) => handleUpdateBidSettings({ ...bidSettings, p2Name: e.target.value })}
                      placeholder="Player 2"
                      className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-400 px-2.5 py-1 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-comic font-bold text-slate-600 uppercase mb-0.5 block">
                      Pop Avatar
                    </label>
                    <div className="flex items-center gap-2 bg-white p-1.5 border-2 border-indigo-100 rounded-xl">
                      {bidP2Pop ? (
                        <img
                          src={bidP2Pop.imageUrl}
                          alt={bidP2Pop.name}
                          className="w-8 h-8 object-cover rounded-lg border-2 border-amber-400 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                          P2
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-comic font-bold text-slate-900 truncate">
                          {bidP2Pop ? bidP2Pop.name : 'Default Avatar'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPopPickerTarget('BID_P2')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-comic font-bold text-[10px] uppercase rounded-lg cursor-pointer shrink-0"
                      >
                        {bidP2Pop ? 'Change' : 'Select'}
                      </button>
                      {bidP2Pop && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBidSettings({ ...bidSettings, p2PopId: null })}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer shrink-0"
                          title="Clear Pop Avatar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: IMPOSTOR SETTINGS */}
            {settingsTab === 'IMPOSTOR' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-comic font-bold text-indigo-950 uppercase tracking-wider">
                    Players ({impostorSettings.players.length})
                  </span>
                  <span className="text-xs font-comic font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-xs">
                    Min 2 Players
                  </span>
                </div>

                {/* Player List */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-white/60 border-2 border-white rounded-2xl mb-2.5 shadow-inner">
                  {impostorSettings.players.map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-comic font-bold text-indigo-900 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={player}
                        onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                        className="flex-1 bg-white border-2 border-indigo-200 focus:border-indigo-400 px-2.5 py-1 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                        placeholder={`Player ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(idx)}
                        disabled={impostorSettings.players.length <= 2}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Remove player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Player Box */}
                <div className="flex gap-1.5 mb-3">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="New Player Name..."
                    className="flex-1 bg-white border-2 border-indigo-200 focus:border-indigo-400 px-3 py-1.5 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-comic font-bold text-xs uppercase flex items-center gap-1 border-2 border-white rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {/* Impostor Count Selector */}
                <div className="flex items-center justify-between bg-white/80 border-2 border-white p-3 rounded-2xl shadow-xs">
                  <div>
                    <div className="text-xs font-comic font-bold text-slate-900 uppercase">Impostors Count</div>
                    <div className="text-[11px] font-comic text-slate-600">Number of impostors in game</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateImpostorSettings({
                          ...impostorSettings,
                          impostorCount: Math.max(1, impostorSettings.impostorCount - 1),
                        })
                      }
                      disabled={impostorSettings.impostorCount <= 1}
                      className="w-7 h-7 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-comic font-bold text-sm disabled:opacity-30 cursor-pointer flex items-center justify-center border border-white shadow-xs"
                    >
                      -
                    </button>
                    <span className="font-comic font-black text-indigo-950 text-sm w-4 text-center">
                      {impostorSettings.impostorCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateImpostorSettings({
                          ...impostorSettings,
                          impostorCount: Math.min(impostorSettings.players.length - 1, impostorSettings.impostorCount + 1),
                        })
                      }
                      disabled={impostorSettings.impostorCount >= impostorSettings.players.length - 1}
                      className="w-7 h-7 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-comic font-bold text-sm disabled:opacity-30 cursor-pointer flex items-center justify-center border border-white shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 mt-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-comic font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] border-2 border-white rounded-2xl cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* POP AVATAR PICKER OVERLAY */}
      {popPickerTarget && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-md w-full border-4 border-slate-900 shadow-2xl flex flex-col max-h-[85vh] font-comic">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div>
                <h3 className="text-lg font-bangers tracking-wide text-slate-900 uppercase">
                  Choose Pop Avatar
                </h3>
                <p className="text-[11px] font-comic font-bold text-slate-600">
                  Select a character from library for{' '}
                  {popPickerTarget === 'GUESS_WHO_P1' && 'Guess Who (Player 1)'}
                  {popPickerTarget === 'GUESS_WHO_P2' && 'Guess Who (Player 2)'}
                  {popPickerTarget === 'BID_P1' && 'Biddy Up (Player 1)'}
                  {popPickerTarget === 'BID_P2' && 'Biddy Up (Player 2)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPopPickerTarget(null);
                  setPopSearch('');
                }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="my-3">
              <input
                type="text"
                value={popSearch}
                onChange={(e) => setPopSearch(e.target.value)}
                placeholder="Search library characters..."
                className="w-full bg-slate-100 border-2 border-slate-300 focus:border-indigo-500 px-3 py-1.5 text-xs font-comic font-bold text-slate-800 rounded-xl outline-none"
              />
            </div>

            {/* Characters Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 pr-1 my-1 max-h-[50vh]">
              {/* Reset to Default */}
              <button
                type="button"
                onClick={() => handleSelectPop(null)}
                className="bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer min-h-[90px] transition-all hover:scale-105"
              >
                <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center mb-1">
                  DEF
                </div>
                <span className="text-[10px] font-comic font-bold text-slate-700">Default</span>
              </button>

              {filteredPopCharacters.map((char) => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => handleSelectPop(char.id)}
                  className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-400 rounded-2xl p-2 flex flex-col items-center text-center cursor-pointer min-h-[90px] transition-all hover:scale-105"
                >
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className="w-10 h-10 object-cover rounded-xl border border-amber-300 mb-1"
                  />
                  <span className="text-[10px] font-comic font-bold text-slate-900 line-clamp-1 w-full">
                    {char.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

