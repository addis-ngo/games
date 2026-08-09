import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { Character } from '../types';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; theme: string; imageUrl: string }) => void;
  initialData?: Character | null;
  existingThemes: string[];
}

// Minimal preset SVG avatars for instant selection
const PRESET_AVATARS = [
  '#E0F2FE', '#FCE7F3', '#FEF3C7', '#DCFCE7', '#F3E8FF', '#FFEDD5', '#CFFAFE', '#F1F5F9'
].map((bg, idx) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${bg}" rx="16"/>
    <circle cx="50" cy="52" r="22" fill="#FFE0BD"/>
    <path d="M44 72 h12 v10 h-12 z" fill="#F3C3A1"/>
    <path d="M22 100 Q 50 78 78 100 Z" fill="#334155"/>
    <path d="M30 46 Q 50 20 70 46 Z" fill="${['#78350F', '#1E293B', '#D97706', '#EF4444', '#B45309', '#4B5563', '#111827', '#2563EB'][idx]}"/>
    <circle cx="42" cy="50" r="2.5" fill="#1E293B"/>
    <circle cx="58" cy="50" r="2.5" fill="#1E293B"/>
    <path d="M44 60 Q 50 66 56 60" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
});

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingThemes,
}) => {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTheme(initialData.theme);
      setImageUrl(initialData.imageUrl);
    } else {
      setName('');
      setTheme('Custom');
      setImageUrl(PRESET_AVATARS[0]);
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Character name is required');
      return;
    }
    if (!imageUrl) {
      setError('An image is required');
      return;
    }

    onSave({
      name: name.trim(),
      theme: theme.trim() || 'General',
      imageUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-medium text-slate-900">
            {initialData ? 'Edit Character' : 'New Character'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          {/* Image Preview & Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
              Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-[11px] text-slate-400">or enter image URL below</div>
              </div>
            </div>

            {/* Quick Preset Avatars */}
            <div className="mt-3">
              <div className="text-[11px] text-slate-400 mb-1.5">Preset options:</div>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(avatar)}
                    className={`aspect-square rounded-lg border overflow-hidden transition-all ${
                      imageUrl === avatar
                        ? 'border-slate-900 ring-2 ring-slate-900/20 scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={avatar} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="mt-3">
              <input
                type="url"
                value={imageUrl.startsWith('data:') ? '' : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              Theme / Category
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Friends, Office, Family"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400"
              />
              {existingThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {existingThemes.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                        theme.toLowerCase() === t.toLowerCase()
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
