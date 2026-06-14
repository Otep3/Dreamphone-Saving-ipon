import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Gamepad2, 
  Compass, 
  Palette, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  PiggyBank, 
  Coins, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { playPopSound, playSuccessSound } from '../utils/audio';

interface OnboardingSliderProps {
  onComplete: (data: {
    userName: string;
    userInitials: string;
    wantName: string;
    wantPrice: number;
    themeVibe: 'golden' | 'cosmic' | 'sage' | 'sakura';
  }) => void;
  onClose?: () => void;
  initialData?: {
    userName: string;
    themeVibe: 'golden' | 'cosmic' | 'sage' | 'sakura';
  };
}

export default function OnboardingSlider({ onComplete, onClose, initialData }: OnboardingSliderProps) {
  const [step, setStep] = useState(0);

  // States for onboarding customization
  const [userName, setUserName] = useState(initialData?.userName || 'Maria Joy');
  const [wantName, setWantName] = useState('iPhone 16 Pro Max');
  const [wantPriceString, setWantPriceString] = useState('64990');
  const [themeVibe, setThemeVibe] = useState<'golden' | 'cosmic' | 'sage' | 'sakura'>(initialData?.themeVibe || 'golden');

  // Want category quick selection
  const wantsPresets = [
    { label: 'iPhone 16 Pro Max', price: '64990', icon: Smartphone, desc: 'Sleek premium device' },
    { label: 'MacBook Air M4', price: '59990', icon: Laptop, desc: 'Ultra-fast productivity machine' },
    { label: 'Nintendo Switch 2', price: '18990', icon: Gamepad2, desc: 'Next-gen gaming container' },
    { label: 'Tokyo Vacation Fund', price: '45000', icon: Compass, desc: 'Dream travel adventure' },
  ];

  // Derive initials helper
  const deriveInitials = (nameInput: string) => {
    const parts = nameInput.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'VA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleNext = () => {
    playPopSound();
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      // Completed, calculate and fire onComplete
      const finalPrice = Math.max(1, parseInt(wantPriceString, 10) || 1000);
      const initials = deriveInitials(userName);
      playSuccessSound();
      onComplete({
        userName: userName.trim() || 'Maria Joy',
        userInitials: initials,
        wantName: wantName.trim() || 'Savings Dream',
        wantPrice: finalPrice,
        themeVibe
      });
    }
  };

  const handlePrev = () => {
    playPopSound();
    if (step > 0) {
      setStep(prev => prev - 1);
    } else if (onClose) {
      onClose();
    }
  };

  const selectPreset = (label: string, price: string) => {
    playPopSound();
    setWantName(label);
    setWantPriceString(price);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.94, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.94, y: 15, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm bg-[#FAF8F5] text-stone-850 rounded-[32px] overflow-hidden shadow-2xl border border-stone-250/20 flex flex-col justify-between min-h-[500px]"
      >
        {/* Aesthetic Visual Header background badge */}
        <div className="relative pt-6 px-6 pb-2 overflow-hidden flex flex-col items-center">
          {/* Accent decoration rings */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-emerald-400/5 blur-lg pointer-events-none" />

          {/* Progress Dots */}
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3].map((dotIndex) => (
              <div
                key={dotIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIndex === step ? 'w-6 bg-stone-900' : 'w-1.5 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Screens with Slide Animation */}
        <div className="px-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4 text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-stone-950/20">
                  <Coins className="w-8 h-8 animate-bounce-slow" />
                </div>

                <div>
                  <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase block mb-1">Welcome Companion</span>
                  <h2 className="text-xl font-black text-stone-900 leading-tight tracking-tight">
                    Personalize your Dream Saving Target!
                  </h2>
                  <p className="text-xs text-stone-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
                    Set your priorities, configure your allowances, and pick a custom aesthetic that matches your vibe!
                  </p>
                </div>

                <div className="space-y-1.5 text-left mt-4 max-w-[280px] mx-auto">
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-stone-400 block px-1">What should we call you?</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value.slice(0, 18))}
                      className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all pl-10 placeholder-stone-400"
                      placeholder="e.g. Maria Joy"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="desire"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase block mb-1">Step 1 — Your Dream Goal</span>
                  <h3 className="text-lg font-black text-stone-900 leading-none tracking-tight">What are you saving for?</h3>
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-tight">We will initialize a dedicated savings vault for this!</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {wantsPresets.map((item) => {
                    const Icon = item.icon;
                    const isSelected = wantName.toLowerCase() === item.label.toLowerCase();
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => selectPreset(item.label, item.price)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between h-24 ${
                          isSelected 
                            ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-md' 
                            : 'bg-white hover:bg-stone-50 border-stone-150 text-stone-800'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-stone-400'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                        </div>
                        <div>
                          <span className="text-[10.5px] font-black line-clamp-1 block leading-tight">{item.label}</span>
                          <span className={`text-[9px] font-bold block mt-0.5 font-mono ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                            ₱{parseInt(item.price, 10).toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom inputs */}
                <div className="space-y-2 mt-1">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8 space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-wider text-stone-400 px-1">Or write custom dream:</label>
                      <input
                        type="text"
                        value={wantName}
                        onChange={(e) => setWantName(e.target.value.slice(0, 30))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder-stone-400"
                        placeholder="Custom title"
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-wider text-stone-400 px-1">Target Price (₱):</label>
                      <input
                        type="number"
                        value={wantPriceString}
                        onChange={(e) => setWantPriceString(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-955"
                        placeholder="64990"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="vibe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-3.5"
              >
                <div className="text-center">
                  <span className="text-[10px] font-black tracking-widest text-[#7c3aed] uppercase block mb-1">Step 2 — Design Style</span>
                  <h3 className="text-lg font-black text-stone-900 leading-none tracking-tight">Pick your Aesthetic Vibe</h3>
                  <p className="text-[11px] text-stone-400 mt-1.5 leading-tight">Switch the app's ambient styling matching your workspace</p>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {/* Golden Honey Vibe */}
                  <div
                    onClick={() => { setThemeVibe('golden'); playPopSound(); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      themeVibe === 'golden' 
                        ? 'border-amber-400 bg-amber-500/10 shadow-sm' 
                        : 'border-stone-150 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-extrabold shadow-sm">
                        🍯
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-850 block">Golden Honey</span>
                        <span className="text-[9.5px] text-stone-400 font-semibold block">Sleek off-white & traditional golden coin aesthetic</span>
                      </div>
                    </div>
                    {themeVibe === 'golden' && <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                  </div>

                  {/* Cosmic Slate Vibe */}
                  <div
                    onClick={() => { setThemeVibe('cosmic'); playPopSound(); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      themeVibe === 'cosmic' 
                        ? 'border-indigo-400 bg-indigo-500/10 shadow-sm' 
                        : 'border-stone-150 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-stone-950 flex items-center justify-center text-[#90E0EF] font-extrabold shadow-sm">
                        🌌
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-850 block">Cosmic Slate</span>
                        <span className="text-[9.5px] text-stone-400 font-semibold block">Moody midnight dark blue and space-metal luxury</span>
                      </div>
                    </div>
                    {themeVibe === 'cosmic' && <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                  </div>

                  {/* Nordic Sage Vibe */}
                  <div
                    onClick={() => { setThemeVibe('sage'); playPopSound(); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      themeVibe === 'sage' 
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-sm' 
                        : 'border-stone-150 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-650 flex items-center justify-center text-emerald-100 font-extrabold shadow-sm">
                        🍃
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-850 block">Nordic Sage</span>
                        <span className="text-[9.5px] text-stone-400 font-semibold block">Organic clean greens & muted forest budget clarity</span>
                      </div>
                    </div>
                    {themeVibe === 'sage' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  </div>

                  {/* Rose Sakura Vibe */}
                  <div
                    onClick={() => { setThemeVibe('sakura'); playPopSound(); }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      themeVibe === 'sakura' 
                        ? 'border-rose-400 bg-rose-500/10 shadow-sm' 
                        : 'border-stone-150 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-400 flex items-center justify-center text-rose-50 font-extrabold shadow-sm">
                        🌸
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-stone-850 block">Rose Sakura</span>
                        <span className="text-[9.5px] text-stone-400 font-semibold block">Playful dusty cherry pink & sweet peach blush warmth</span>
                      </div>
                    </div>
                    {themeVibe === 'sakura' && <CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4 text-center py-2"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase block mb-1">All Set for Micro-Savings! 🏁</span>
                  <h3 className="text-lg font-black text-stone-900 leading-none tracking-tight">Your Custom Vault is Ready</h3>
                  <p className="text-xs text-stone-500 mt-2 max-w-[260px] mx-auto leading-relaxed">
                    We've tailor-configured your experience. Review your parameters below before launching!
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 text-left space-y-2.5 max-w-[280px] mx-auto">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-400">Owner Profile:</span>
                    <span className="font-extrabold text-stone-800">{userName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-400">Vault Item:</span>
                    <span className="font-extrabold text-stone-800 line-clamp-1 max-w-[130px]">{wantName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-400">Item Price:</span>
                    <span className="font-extrabold font-mono text-stone-800">₱{parseInt(wantPriceString, 10).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-stone-400">Theme Vibe:</span>
                    <span className="font-extrabold capitalize text-stone-800 flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        themeVibe === 'cosmic' ? 'bg-indigo-400' : themeVibe === 'sage' ? 'bg-emerald-400' : themeVibe === 'sakura' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      {themeVibe}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls Navigation Footer */}
        <div className="p-6 bg-white border-t border-stone-150/40 flex justify-between gap-3 items-center">
          <button
            type="button"
            onClick={handlePrev}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 text-stone-500 hover:text-stone-700 hover:bg-stone-50 flex items-center gap-1 cursor-pointer select-none`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-1 px-5 py-3 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-stone-900/10 leading-none select-none"
          >
            {step === 3 ? 'Launch My Vault ✨' : 'Continue'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
