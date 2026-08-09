import React, { useState, useEffect } from 'react';
import { Character, ScreenMode, GamePhase, Player, GameSession, CharacterImpostorSession, ImpostorPlayerRole } from './types';
import {
  getLibrary,
  addCharacter,
  updateCharacter,
  deleteCharacter,
  resetLibraryToDefaults,
  toggleExcludeCharacter,
  getRandomCharactersForGame,
  getImpostorSettings,
  getGuessWhoSettings,
} from './utils/storage';

import { MainScreen } from './components/MainScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { PassDeviceScreen } from './components/PassDeviceScreen';
import { SecretSelectScreen } from './components/SecretSelectScreen';
import { SecretRevealScreen } from './components/SecretRevealScreen';
import { GameBoard } from './components/GameBoard';
import { WinnerScreen } from './components/WinnerScreen';
import { CharacterImpostorGame } from './components/CharacterImpostorGame';
import { BlindRankGame } from './components/BlindRankGame';
import { QuestionImpostorGame, QuestionImpostorPlayer } from './components/QuestionImpostorGame';
import { BidGame } from './components/BidGame';
import { getRandomQuestionPair } from './data/questionPairs';
import { QuestionPair } from './types';

export default function App() {
  const [screenMode, setScreenMode] = useState<ScreenMode>('HOME');
  const [library, setLibrary] = useState<Character[]>([]);

  // Active game session state (Guess Who)
  const [gamePhase, setGamePhase] = useState<GamePhase>('SECRET_SELECT_P1_PASS');
  const [gameSession, setGameSession] = useState<GameSession>({
    characters: [],
    p1: { secretCharacterId: null, eliminatedIds: [] },
    p2: { secretCharacterId: null, eliminatedIds: [] },
    currentTurn: 'P1',
    winner: null,
    lastMessage: null,
  });

  // Active Impostor game session state
  const [impostorSession, setImpostorSession] = useState<CharacterImpostorSession | null>(null);

  // Active Blind Rank state
  const [blindRankCharacters, setBlindRankCharacters] = useState<Character[]>([]);

  // Active Bid state
  const [bidCharacters, setBidCharacters] = useState<Character[]>([]);

  // Active Question Impostor state
  const [questionImpostorSession, setQuestionImpostorSession] = useState<{
    questionPair: QuestionPair;
    mainQuestion: string;
    impostorQuestion: string;
    playerRoles: QuestionImpostorPlayer[];
    impostorNames: string[];
  } | null>(null);

  // Load library on mount
  useEffect(() => {
    const loaded = getLibrary();
    setLibrary(loaded);
  }, []);

  const refreshLibrary = () => {
    setLibrary(getLibrary());
  };

  // Start new game
  const handleStartGame = (selectedCategories?: string[]) => {
    const selected24 = getRandomCharactersForGame(24, selectedCategories);
    const guessWhoSettings = getGuessWhoSettings();

    if (guessWhoSettings.randomSecretCharacter) {
      // Pick 2 distinct random secret characters for P1 and P2
      const p1Idx = Math.floor(Math.random() * selected24.length);
      let p2Idx = Math.floor(Math.random() * selected24.length);
      if (selected24.length > 1) {
        while (p2Idx === p1Idx) {
          p2Idx = Math.floor(Math.random() * selected24.length);
        }
      }

      setGameSession({
        characters: selected24,
        p1: { secretCharacterId: selected24[p1Idx].id, eliminatedIds: [] },
        p2: { secretCharacterId: selected24[p2Idx].id, eliminatedIds: [] },
        currentTurn: 'P1',
        winner: null,
        lastMessage: null,
      });
      setGamePhase('SECRET_REVEAL_P1_PASS');
      setScreenMode('GAME');
    } else {
      setGameSession({
        characters: selected24,
        p1: { secretCharacterId: null, eliminatedIds: [] },
        p2: { secretCharacterId: null, eliminatedIds: [] },
        currentTurn: 'P1',
        winner: null,
        lastMessage: null,
      });
      setGamePhase('SECRET_SELECT_P1_PASS');
      setScreenMode('GAME');
    }
  };

  // Secret Selection handlers
  const handleSelectSecretP1 = (characterId: string) => {
    setGameSession((prev) => ({
      ...prev,
      p1: { ...prev.p1, secretCharacterId: characterId },
    }));
    setGamePhase('SECRET_SELECT_P2_PASS');
  };

  const handleSelectSecretP2 = (characterId: string) => {
    setGameSession((prev) => ({
      ...prev,
      p2: { ...prev.p2, secretCharacterId: characterId },
      currentTurn: 'P1',
    }));
    setGamePhase('TURN_PASS');
  };

  // Toggle character elimination on current player's board
  const handleToggleEliminated = (characterId: string) => {
    setGameSession((prev) => {
      const activePlayer = prev.currentTurn;
      const playerState = activePlayer === 'P1' ? prev.p1 : prev.p2;
      const isAlreadyEliminated = playerState.eliminatedIds.includes(characterId);

      const newEliminated = isAlreadyEliminated
        ? playerState.eliminatedIds.filter((id) => id !== characterId)
        : [...playerState.eliminatedIds, characterId];

      return {
        ...prev,
        [activePlayer === 'P1' ? 'p1' : 'p2']: {
          ...playerState,
          eliminatedIds: newEliminated,
        },
      };
    });
  };

  // Specific Guess Handler
  const handleGuessCharacter = (guessedCharacterId: string) => {
    const activePlayer = gameSession.currentTurn;
    const opponent = activePlayer === 'P1' ? 'P2' : 'P1';
    const opponentSecretId =
      opponent === 'P1' ? gameSession.p1.secretCharacterId : gameSession.p2.secretCharacterId;

    if (guessedCharacterId === opponentSecretId) {
      // Victory!
      setGameSession((prev) => ({
        ...prev,
        winner: activePlayer,
        lastMessage: null,
      }));
      setGamePhase('GAME_OVER');
    } else {
      // Incorrect guess! End turn and display message
      const guessedChar = gameSession.characters.find((c) => c.id === guessedCharacterId);
      const guessedName = guessedChar ? guessedChar.name : 'that character';
      const opponentLabel = opponent === 'P1' ? 'Player 1' : 'Player 2';

      setGameSession((prev) => ({
        ...prev,
        currentTurn: opponent,
        lastMessage: `Incorrect guess! It is not ${guessedName}. Turn passed to ${opponentLabel}.`,
      }));
      setGamePhase('TURN_PASS');
    }
  };

  // End Turn
  const handleEndTurn = () => {
    const nextPlayer: Player = gameSession.currentTurn === 'P1' ? 'P2' : 'P1';
    setGameSession((prev) => ({
      ...prev,
      currentTurn: nextPlayer,
      lastMessage: null,
    }));
    setGamePhase('TURN_PASS');
  };

  // Library Handlers
  const handleAddCharacter = (data: { name: string; theme: string; imageUrl: string }) => {
    addCharacter(data);
    refreshLibrary();
  };

  const handleUpdateCharacter = (
    id: string,
    data: { name: string; theme: string; imageUrl: string }
  ) => {
    updateCharacter(id, data);
    refreshLibrary();
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter(id);
    refreshLibrary();
  };

  const handleResetLibrary = () => {
    resetLibraryToDefaults();
    refreshLibrary();
  };

  const handleToggleExcludeCharacter = (id: string) => {
    toggleExcludeCharacter(id);
    refreshLibrary();
  };

  // Start Character Impostor Game
  const handleStartCharacterImpostor = (selectedCategories?: string[]) => {
    const settings = getImpostorSettings();
    const playerNames =
      settings.players && settings.players.length >= 2
        ? settings.players
        : ['Player 1', 'Player 2', 'Player 3'];
    const countImpostors = Math.min(settings.impostorCount || 1, playerNames.length - 1);

    // Pick 1 random secret character
    const randomChars = getRandomCharactersForGame(1, selectedCategories);
    const secretCharacter = randomChars[0];

    // Pick random impostors
    const indices = Array.from({ length: playerNames.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const impostorIndicesSet = new Set(indices.slice(0, countImpostors));

    const playerRoles: ImpostorPlayerRole[] = playerNames.map((name, i) => ({
      playerName: name,
      isImpostor: impostorIndicesSet.has(i),
    }));

    const impostorNames = playerRoles.filter((p) => p.isImpostor).map((p) => p.playerName);

    setImpostorSession({
      secretCharacter,
      players: playerRoles,
      impostorNames,
    });

    setScreenMode('CHARACTER_IMPOSTOR');
  };

  // Start Blind Rank Game
  const handleStartBlindRank = (selectedCategories?: string[]) => {
    const random5 = getRandomCharactersForGame(5, selectedCategories);
    setBlindRankCharacters(random5);
    setScreenMode('BLIND_RANK');
  };

  // Start Bid Game
  const handleStartBid = (selectedCategories?: string[]) => {
    const queue = getRandomCharactersForGame(500, selectedCategories);
    setBidCharacters(queue);
    setScreenMode('BID');
  };

  // Start Question Impostor Game
  const handleStartQuestionImpostor = () => {
    const settings = getImpostorSettings();
    const playerNames =
      settings.players && settings.players.length >= 2
        ? settings.players
        : ['Player 1', 'Player 2', 'Player 3'];
    const countImpostors = Math.min(settings.impostorCount || 1, playerNames.length - 1);

    const questionPair = getRandomQuestionPair();

    // Randomly select 2 distinct questions out of 3
    const availableQuestions = [questionPair.question1, questionPair.question2, questionPair.question3];
    for (let i = availableQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
    }
    const [mainQuestion, impostorQuestion] = availableQuestions;

    // Pick random impostors
    const indices = Array.from({ length: playerNames.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const impostorIndicesSet = new Set(indices.slice(0, countImpostors));

    const playerRoles: QuestionImpostorPlayer[] = playerNames.map((name, i) => {
      const isImpostor = impostorIndicesSet.has(i);
      return {
        playerName: name,
        isImpostor,
        questionReceived: isImpostor ? impostorQuestion : mainQuestion,
      };
    });

    const impostorNames = playerRoles.filter((p) => p.isImpostor).map((p) => p.playerName);

    setQuestionImpostorSession({
      questionPair,
      mainQuestion,
      impostorQuestion,
      playerRoles,
      impostorNames,
    });

    setScreenMode('QUESTION_IMPOSTOR');
  };

  // Render logic
  if (screenMode === 'HOME') {
    return (
      <MainScreen
        onPlay={handleStartGame}
        onPlayCharacterImpostor={handleStartCharacterImpostor}
        onPlayQuestionImpostor={handleStartQuestionImpostor}
        onPlayBlindRank={handleStartBlindRank}
        onPlayBid={handleStartBid}
        onOpenLibrary={() => setScreenMode('LIBRARY')}
        characters={library}
      />
    );
  }

  if (screenMode === 'BID' && bidCharacters.length > 0) {
    return (
      <BidGame
        characters={bidCharacters}
        onPlayAgain={() => handleStartBid()}
        onHome={() => setScreenMode('HOME')}
      />
    );
  }

  if (screenMode === 'QUESTION_IMPOSTOR' && questionImpostorSession) {
    return (
      <QuestionImpostorGame
        questionPair={questionImpostorSession.questionPair}
        mainQuestion={questionImpostorSession.mainQuestion}
        impostorQuestion={questionImpostorSession.impostorQuestion}
        playerRoles={questionImpostorSession.playerRoles}
        impostorNames={questionImpostorSession.impostorNames}
        onHome={() => setScreenMode('HOME')}
      />
    );
  }

  if (screenMode === 'BLIND_RANK' && blindRankCharacters.length > 0) {
    return (
      <BlindRankGame
        characters={blindRankCharacters}
        onPlayAgain={() => handleStartBlindRank()}
        onHome={() => setScreenMode('HOME')}
      />
    );
  }

  if (screenMode === 'CHARACTER_IMPOSTOR' && impostorSession) {
    return (
      <CharacterImpostorGame
        secretCharacter={impostorSession.secretCharacter}
        players={impostorSession.players}
        impostorNames={impostorSession.impostorNames}
        onHome={() => setScreenMode('HOME')}
      />
    );
  }

  if (screenMode === 'LIBRARY') {
    return (
      <LibraryScreen
        characters={library}
        onBack={() => setScreenMode('HOME')}
        onAddCharacter={handleAddCharacter}
        onUpdateCharacter={handleUpdateCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        onResetLibrary={handleResetLibrary}
        onToggleExcludeCharacter={handleToggleExcludeCharacter}
      />
    );
  }

  // GAME MODE
  if (screenMode === 'GAME') {
    // Secret Selection Pass 1
    if (gamePhase === 'SECRET_SELECT_P1_PASS') {
      return (
        <PassDeviceScreen
          player="P1"
          title="Pass device to Player 1"
          subtext="Player 1 will pick their secret character first."
          characters={library}
          onReady={() => setGamePhase('SECRET_SELECT_P1')}
        />
      );
    }

    // Secret Selection P1
    if (gamePhase === 'SECRET_SELECT_P1') {
      return (
        <SecretSelectScreen
          player="P1"
          characters={gameSession.characters}
          onSelect={handleSelectSecretP1}
        />
      );
    }

    // Secret Selection Pass 2
    if (gamePhase === 'SECRET_SELECT_P2_PASS') {
      return (
        <PassDeviceScreen
          player="P2"
          title="Pass device to Player 2"
          subtext="Make sure Player 1 is not looking! Player 2 will pick their secret character."
          characters={library}
          onReady={() => setGamePhase('SECRET_SELECT_P2')}
        />
      );
    }

    // Secret Selection P2
    if (gamePhase === 'SECRET_SELECT_P2') {
      return (
        <SecretSelectScreen
          player="P2"
          characters={gameSession.characters}
          onSelect={handleSelectSecretP2}
        />
      );
    }

    // Secret Reveal Pass 1 (for random character mode)
    if (gamePhase === 'SECRET_REVEAL_P1_PASS') {
      return (
        <PassDeviceScreen
          player="P1"
          title="Pass device to Player 1"
          subtext="Player 1 will view their assigned secret character."
          characters={library}
          onReady={() => setGamePhase('SECRET_REVEAL_P1')}
        />
      );
    }

    // Secret Reveal P1
    if (gamePhase === 'SECRET_REVEAL_P1') {
      const p1Char = gameSession.characters.find((c) => c.id === gameSession.p1.secretCharacterId);
      if (!p1Char) return null;
      return (
        <SecretRevealScreen
          player="P1"
          character={p1Char}
          onConfirm={() => setGamePhase('SECRET_REVEAL_P2_PASS')}
        />
      );
    }

    // Secret Reveal Pass 2
    if (gamePhase === 'SECRET_REVEAL_P2_PASS') {
      return (
        <PassDeviceScreen
          player="P2"
          title="Pass device to Player 2"
          subtext="Make sure Player 1 is not looking! Player 2 will view their assigned secret character."
          characters={library}
          onReady={() => setGamePhase('SECRET_REVEAL_P2')}
        />
      );
    }

    // Secret Reveal P2
    if (gamePhase === 'SECRET_REVEAL_P2') {
      const p2Char = gameSession.characters.find((c) => c.id === gameSession.p2.secretCharacterId);
      if (!p2Char) return null;
      return (
        <SecretRevealScreen
          player="P2"
          character={p2Char}
          onConfirm={() => setGamePhase('TURN_PASS')}
        />
      );
    }

    // Pass device between turns
    if (gamePhase === 'TURN_PASS') {
      const gwSettings = getGuessWhoSettings();
      const activeLabel = gameSession.currentTurn === 'P1' ? (gwSettings.p1Name || 'Player 1') : (gwSettings.p2Name || 'Player 2');
      return (
        <PassDeviceScreen
          player={gameSession.currentTurn}
          title={`Pass device to ${activeLabel}`}
          subtext={`It is now ${activeLabel}'s turn.`}
          characters={library}
          onReady={() => setGamePhase('PLAYING')}
        />
      );
    }

    // Playing Board
    if (gamePhase === 'PLAYING') {
      const activePlayer = gameSession.currentTurn;
      const playerState = activePlayer === 'P1' ? gameSession.p1 : gameSession.p2;
      const opponentSecretId =
        activePlayer === 'P1' ? gameSession.p2.secretCharacterId : gameSession.p1.secretCharacterId;

      return (
        <GameBoard
          currentTurn={activePlayer}
          characters={gameSession.characters}
          playerState={playerState}
          opponentSecretCharacterId={opponentSecretId}
          lastMessage={gameSession.lastMessage}
          onToggleEliminated={handleToggleEliminated}
          onGuessCharacter={handleGuessCharacter}
          onEndTurn={handleEndTurn}
          onResetGame={handleStartGame}
        />
      );
    }

    // Game Over
    if (gamePhase === 'GAME_OVER' && gameSession.winner) {
      const p1Char = gameSession.characters.find((c) => c.id === gameSession.p1.secretCharacterId);
      const p2Char = gameSession.characters.find((c) => c.id === gameSession.p2.secretCharacterId);

      return (
        <WinnerScreen
          winner={gameSession.winner}
          p1SecretChar={p1Char}
          p2SecretChar={p2Char}
          onPlayAgain={handleStartGame}
          onHome={() => setScreenMode('HOME')}
        />
      );
    }
  }

  return null;
}
