import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles } from 'lucide-react';
import { playSlideSound, playPopSound } from '../utils/audio';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    category: string;
    color: string;
    dueDate: string;
    imageUrl?: string;
  }) => void;
}

export default function AddGoalModal({ isOpen, onClose, onAddGoal }: AddGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [category, setCategory] = useState('Primary');
  const [colorPreset, setColorPreset] = useState('amber');
  const [dueDate, setDueDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const colorPresets = [
    { value: 'amber', label: 'Sunset Amber', bg: 'bg-amber-400' },
    { value: 'blue', label: 'Aurora Blue', bg: 'bg-blue-400' },
    { value: 'emerald', label: 'Forest Mint', bg: 'bg-emerald-400' },
    { value: 'purple', label: 'Cosmic Violet', bg: 'bg-purple-400' },
    { value: 'rose', label: 'Satin Rose', bg: 'bg-rose-400' },
  ];

  const phonePresets = [
    { name: 'iPhone 15 Pro', price: '75990', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80' },
    { name: 'iPad Pro OLED', price: '69990', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80' },
    { name: 'AirPods Pro 2', price: '14990', url: 'https://images.unsplash.com/photo-1588449668338-d13417f16ecf?w=400&auto=format&fit=crop&q=80' },
    { name: 'Redmi Turbo 5 Pro', price: '24990', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80' },
  ];

  const handleApplyPreset = (p: typeof phonePresets[0]) => {
    setName(p.name);
    setTargetAmount(p.price);
    setImageUrl(p.url);
    playPopSound();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name || isNaN(target) || target <= 0) return;

    onAddGoal({
      name,
      targetAmount: target,
      currentAmount: current,
      category,
      color: colorPreset,
      dueDate: dueDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days default
      imageUrl: imageUrl || undefined
    });

    playPopSound();
    
    // Reset Form
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setCategory('Primary');
    setDueDate('');
    setImageUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950 z-40 transition-opacity"
          />

          {/* Drawer container (Swipe customizable) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 140) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#FDFDFB] rounded-t-[32px] border-t border-stone-100 shadow-[0_-12px_45px_rgba(0,0,0,0.08)] z-50 overflow-hidden outline-none touch-none"
            style={{ maxHeight: '92vh' }}
          >
            {/* Gesture drag handle bar for native look */}
            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1 rounded-full bg-stone-200" />
            </div>

            <div className="px-6 pb-8 overflow-y-auto max-h-[85vh] touch-pan-y">
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-lg font-bold text-stone-850 tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    Configure Dream Goal
                  </h3>
                  <p className="text-xs text-stone-400">Spawn a new micro-savings repository</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 text-stone-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Goal Quick Presets */}
              <div className="mb-6 bg-stone-50/75 rounded-2xl p-4 border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block mb-2.5 uppercase tracking-wider">Quick Presets</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {phonePresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-3 py-2 bg-white rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:border-stone-400 hover:bg-stone-50 select-none cursor-pointer whitespace-nowrap whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"/>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Goal Name */}
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Device or Target Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. PlayStation 6 Pro"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white/50 text-stone-850 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold"
                  />
                </div>

                {/* 2. Target Cost & Initial Fund */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Target Price (₱)</label>
                    <input
                      type="number"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="e.g. 75990"
                      min="1"
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white/50 text-stone-850 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Starting Savings (₱)</label>
                    <input
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      min="0"
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white/50 text-stone-850 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>

                {/* 3. Category & Target Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white/50 text-stone-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold"
                    >
                      <option value="Primary">Primary Target</option>
                      <option value="Accessory">Accessory</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Other">Custom Vault</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Target Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-white/50 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>

                {/* 4. Target Custom Image Unsplash/Placeholder link */}
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1 uppercase tracking-wider">Optional Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste premium Unsplash item link"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-white/50 text-stone-850 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold"
                  />
                </div>

                {/* 5. Theme Gradient Preset choice */}
                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-2 uppercase tracking-wider">Vault Aesthetic Shader</label>
                  <div className="flex gap-3 justify-between items-center bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => { setColorPreset(preset.value); playSlideSound(); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${preset.bg} ${
                          colorPreset === preset.value 
                            ? 'scale-110 ring-4 ring-stone-900/10 border-2 border-white' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold py-4 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-stone-900/10 active:scale-[0.98] text-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Spawn Savings Goal
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
