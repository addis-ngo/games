import { Character, ImpostorSettings, GuessWhoSettings, BidSettings } from '../types';
import { INITIAL_CHARACTERS } from '../data/defaultCharacters';

const STORAGE_KEY = 'guess_who_custom_library_v2';
const IMPOSTOR_SETTINGS_KEY = 'ichigo_bankai_impostor_settings_v1';
const GUESS_WHO_SETTINGS_KEY = 'ichigo_bankai_guess_who_settings_v1';
const BID_SETTINGS_KEY = 'ichigo_bankai_bid_settings_v1';

export const DEFAULT_GUESS_WHO_SETTINGS: GuessWhoSettings = {
  randomSecretCharacter: false,
  p1Name: 'Player 1',
  p1PopId: null,
  p2Name: 'Player 2',
  p2PopId: null,
};

export const DEFAULT_BID_SETTINGS: BidSettings = {
  p1Name: 'Player 1',
  p1PopId: null,
  p2Name: 'Player 2',
  p2PopId: null,
};

export const getGuessWhoSettings = (): GuessWhoSettings => {
  try {
    const raw = localStorage.getItem(GUESS_WHO_SETTINGS_KEY);
    if (!raw) return DEFAULT_GUESS_WHO_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      randomSecretCharacter: Boolean(parsed?.randomSecretCharacter),
      p1Name: parsed?.p1Name !== undefined ? String(parsed.p1Name).trim() || 'Player 1' : 'Player 1',
      p1PopId: parsed?.p1PopId ?? null,
      p2Name: parsed?.p2Name !== undefined ? String(parsed.p2Name).trim() || 'Player 2' : 'Player 2',
      p2PopId: parsed?.p2PopId ?? null,
    };
  } catch (e) {
    return DEFAULT_GUESS_WHO_SETTINGS;
  }
};

export const saveGuessWhoSettings = (settings: GuessWhoSettings): void => {
  try {
    localStorage.setItem(GUESS_WHO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save guess who settings', e);
  }
};

export const getBidSettings = (): BidSettings => {
  try {
    const raw = localStorage.getItem(BID_SETTINGS_KEY);
    if (!raw) return DEFAULT_BID_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      p1Name: parsed?.p1Name !== undefined ? String(parsed.p1Name).trim() || 'Player 1' : 'Player 1',
      p1PopId: parsed?.p1PopId ?? null,
      p2Name: parsed?.p2Name !== undefined ? String(parsed.p2Name).trim() || 'Player 2' : 'Player 2',
      p2PopId: parsed?.p2PopId ?? null,
    };
  } catch (e) {
    return DEFAULT_BID_SETTINGS;
  }
};

export const saveBidSettings = (settings: BidSettings): void => {
  try {
    localStorage.setItem(BID_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save bid settings', e);
  }
};

export const DEFAULT_IMPOSTOR_SETTINGS: ImpostorSettings = {
  players: ['Player 1', 'Player 2', 'Player 3'],
  impostorCount: 1,
};

export const getImpostorSettings = (): ImpostorSettings => {
  try {
    const raw = localStorage.getItem(IMPOSTOR_SETTINGS_KEY);
    if (!raw) return DEFAULT_IMPOSTOR_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.players) && parsed.players.length >= 2) {
      const validPlayers = parsed.players.map((p: any) => String(p).trim()).filter(Boolean);
      if (validPlayers.length < 2) return DEFAULT_IMPOSTOR_SETTINGS;
      const impostorCount = Math.min(
        Math.max(1, Number(parsed.impostorCount) || 1),
        Math.max(1, validPlayers.length - 1)
      );
      return {
        players: validPlayers,
        impostorCount,
      };
    }
    return DEFAULT_IMPOSTOR_SETTINGS;
  } catch (e) {
    return DEFAULT_IMPOSTOR_SETTINGS;
  }
};

export const saveImpostorSettings = (settings: ImpostorSettings): void => {
  try {
    localStorage.setItem(IMPOSTOR_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save impostor settings', e);
  }
};

export const getLibrary = (): Character[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHARACTERS));
      return INITIAL_CHARACTERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        ...item,
        category: item.category || item.theme || 'General',
        theme: item.category || item.theme || 'General',
      }));
    }
    return INITIAL_CHARACTERS;
  } catch (e) {
    console.error('Failed to load library from storage', e);
    return INITIAL_CHARACTERS;
  }
};

export const saveLibrary = (characters: Character[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  } catch (e) {
    console.error('Failed to save library to storage', e);
  }
};

export const resetLibraryToDefaults = (): Character[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHARACTERS));
  } catch (e) {
    console.error('Failed to reset library', e);
  }
  return INITIAL_CHARACTERS;
};

export const addCharacter = (data: { name: string; theme: string; imageUrl: string }): Character => {
  const current = getLibrary();
  const newChar: Character = {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: data.name.trim(),
    category: data.theme.trim() || 'General',
    theme: data.theme.trim() || 'General',
    imageUrl: data.imageUrl,
    createdAt: Date.now(),
  };
  const updated = [newChar, ...current];
  saveLibrary(updated);
  return newChar;
};

export const updateCharacter = (
  id: string,
  data: { name?: string; theme?: string; imageUrl?: string }
): void => {
  const current = getLibrary();
  const updated = current.map((char) => {
    if (char.id === id) {
      return {
        ...char,
        name: data.name !== undefined ? data.name.trim() : char.name,
        category: data.theme !== undefined ? data.theme.trim() || 'General' : char.category || char.theme || 'General',
        theme: data.theme !== undefined ? data.theme.trim() || 'General' : char.theme || 'General',
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : char.imageUrl,
      };
    }
    return char;
  });
  saveLibrary(updated);
};

export const deleteCharacter = (id: string): void => {
  const current = getLibrary();
  const updated = current.filter((char) => char.id !== id);
  saveLibrary(updated);
};

export const toggleExcludeCharacter = (id: string): void => {
  const current = getLibrary();
  const updated = current.map((char) => {
    if (char.id === id) {
      return { ...char, excluded: !char.excluded };
    }
    return char;
  });
  saveLibrary(updated);
};

export const getRandomCharactersForGame = (
  count: number = 24,
  selectedCategories?: string[]
): Character[] => {
  const library = getLibrary();

  // 1. Filter out excluded characters
  let activePool = library.filter((char) => !char.excluded);

  // 2. Filter by selectedCategories if provided and non-empty
  if (selectedCategories && selectedCategories.length > 0) {
    const isAll = selectedCategories.some((cat) => cat.toUpperCase() === 'ALL');
    if (!isAll) {
      const selectedSet = new Set(selectedCategories.map((c) => c.toLowerCase()));
      activePool = activePool.filter((char) => {
        const cat = (char.category || char.theme || 'General').toLowerCase();
        return selectedSet.has(cat);
      });
    }
  }

  // If active pool is completely empty, create default numbered placeholders
  if (activePool.length === 0) {
    return Array.from({ length: count }, (_, i) => ({
      id: `placeholder-${i + 1}`,
      name: `Character ${i + 1}`,
      category: 'General',
      theme: 'General',
      imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#F1F5F9"/><circle cx="50" cy="45" r="20" fill="#CBD5E1"/><path d="M25 85 Q 50 65 75 85 Z" fill="#94A3B8"/><text x="50" y="94" font-family="sans-serif" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">Custom #${i + 1}</text></svg>`
      )}`,
    }));
  }

  // If active pool has fewer than count, pad with copies of active pool characters
  if (activePool.length < count) {
    const combined = [...activePool];
    let counter = 1;
    while (combined.length < count) {
      const src = activePool[(counter - 1) % activePool.length];
      combined.push({
        ...src,
        id: `pad-${counter}-${src.id}`,
        name: `${src.name} #${counter + 1}`,
      });
      counter++;
    }
    activePool = combined;
  }

  // Shuffle array using Fisher-Yates
  const shuffled = [...activePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

