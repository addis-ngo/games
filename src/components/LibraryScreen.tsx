import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit2, Trash2, Plus, RefreshCw, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { Character } from '../types';
import { CharacterModal } from './CharacterModal';

interface LibraryScreenProps {
  characters: Character[];
  onBack: () => void;
  onAddCharacter: (data: { name: string; theme: string; imageUrl: string }) => void;
  onUpdateCharacter: (id: string, data: { name: string; theme: string; imageUrl: string }) => void;
  onDeleteCharacter: (id: string) => void;
  onResetLibrary: () => void;
  onToggleExcludeCharacter: (id: string) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  characters,
  onBack,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onResetLibrary,
  onToggleExcludeCharacter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Extract all unique categories
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    characters.forEach((c) => {
      const cat = c.category || c.theme;
      if (cat) cats.add(cat);
    });
    return Array.from(cats).sort();
  }, [characters]);

  // Counts
  const activeCount = useMemo(() => characters.filter((c) => !c.excluded).length, [characters]);
  const excludedCount = useMemo(() => characters.filter((c) => c.excluded).length, [characters]);

  // Filtered list
  const filteredCharacters = useMemo(() => {
    if (selectedCategory === 'ALL') return characters;
    return characters.filter((c) => {
      const cat = c.category || c.theme || '';
      return cat.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [characters, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingCharacter(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: { name: string; theme: string; imageUrl: string }) => {
    if (editingCharacter) {
      onUpdateCharacter(editingCharacter.id, data);
    } else {
      onAddCharacter(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="min-h-screen bg-slate-50 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto select-none"
    >
      {/* Sticky Top Header Navigation */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md -mt-4 sm:-mt-6 pt-4 sm:pt-6 pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-200 shadow-xs mb-2">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-medium text-slate-900">Character Library</h1>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{characters.length} total characters</span>
                {characters.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">{activeCount} active in pool</span>
                    {excludedCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-medium">{excludedCount} excluded</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetLibrary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              title="Reload characters defined in /src/data/defaultCharacters.ts"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync File
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Character
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        {uniqueCategories.length > 0 && characters.length > 0 && (
          <div className="pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All ({characters.length})
            </button>
            {uniqueCategories.map((cat) => {
              const catChars = characters.filter(
                (c) => (c.category || c.theme || '').toLowerCase() === cat.toLowerCase()
              );
              const count = catChars.length;
              const activeCatCount = catChars.filter((c) => !c.excluded).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat} ({activeCatCount}/{count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Characters Grid */}
      {characters.length > 0 ? (
        <div className="py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 flex-1">
          {filteredCharacters.map((char) => {
            const isExcluded = !!char.excluded;
            return (
              <div
                key={char.id}
                className={`group bg-white rounded-xl border p-2.5 flex flex-col items-center text-center relative transition-all shadow-2xs ${
                  isExcluded
                    ? 'border-slate-200 bg-slate-50/80 opacity-75 hover:opacity-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Image */}
                <div className="w-full aspect-square rounded-lg bg-amber-100 overflow-hidden mb-2 border border-amber-300/60 relative">
                  <img
                    src={char.imageUrl}
                    alt={char.name}
                    className={`w-full h-full object-cover transition-all ${
                      isExcluded ? 'grayscale opacity-60' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Excluded Overlay Badge */}
                  {isExcluded && (
                    <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <EyeOff className="w-2.5 h-2.5" />
                      Excluded
                    </div>
                  )}

                  {/* Toggle Exclude Button on Image Hover / Always visible on excluded */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExcludeCharacter(char.id);
                    }}
                    className={`absolute bottom-1.5 right-1.5 p-1.5 rounded-lg text-xs font-medium backdrop-blur-md transition-all shadow-xs ${
                      isExcluded
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-white/90 hover:bg-white text-slate-700 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isExcluded ? 'Include in game' : 'Exclude from game'}
                  >
                    {isExcluded ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-500 hover:text-amber-600" />
                    )}
                  </button>
                </div>

                {/* Name */}
                <div className={`text-xs font-bold truncate w-full ${isExcluded ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {char.name}
                </div>

                {/* Category Badge */}
                <div className="text-[10px] font-medium text-slate-400 truncate w-full mt-0.5">
                  {char.category || char.theme || 'General'}
                </div>

                {/* Edit / Delete overlay buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 shadow-xs">
                  <button
                    onClick={() => handleOpenEdit(char)}
                    className="p-1 hover:text-slate-900 text-slate-500 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteCharacter(char.id)}
                    className="p-1 hover:text-rose-600 text-slate-400 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCharacters.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              No characters found in this category.
            </div>
          )}
        </div>
      ) : (
        /* Clean Empty State Guidance */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-medium text-slate-800 mb-2">Library is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            You can add your characters directly in code in <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">/src/data/defaultCharacters.ts</code> or click the button below to add characters through the screen.
          </p>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add First Character
          </button>
        </div>
      )}

      {/* Modal for adding/editing */}
      <CharacterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingCharacter}
        existingThemes={uniqueCategories}
      />
    </motion.div>
  );
};

