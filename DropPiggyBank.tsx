import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins } from 'lucide-react';
import { playCoinSound } from '../utils/audio';

interface DropPiggyBankProps {
  onDeposit: (amount: number, note: string) => void;
  activeGoalName: string;
  disabled?: boolean;
}

export default function DropPiggyBank({ onDeposit, activeGoalName, disabled = false }: DropPiggyBankProps) {
  const [isOver, setIsOver] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Floating coins configuration
  const coinOptions = [
    { value: 50, color: 'bg-stone-50 border-stone-200 text-stone-700 font-semibold' },
    { value: 100, color: 'bg-cream-100 border-yellow-200 text-yellow-800 font-bold' },
    { value: 500, color: 'bg-amber-500 border-amber-600 text-white font-extrabold shadow-sm' },
  ];

  const handleDrag = (_event: any, info: any) => {
    if (disabled || !dropZoneRef.current) return;
    const rect = dropZoneRef.current.getBoundingClientRect();
    
    // Check if device pointer is hovering over the deposit pad rect
    const isHovering = 
      info.point.x >= rect.left &&
      info.point.x <= rect.right &&
      info.point.y >= rect.top &&
      info.point.y <= rect.bottom;

    setIsOver(isHovering);
  };

  const handleDragEnd = (_event: any, info: any, value: number) => {
    if (disabled) return;
    if (isOver) {
      // Trigger deposit!
      playCoinSound();
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      onDeposit(value, `Gesture swipe deposit (₱${value})`);
      setIsOver(false);
      setSuccessAnimation(value);
      setTimeout(() => setSuccessAnimation(null), 1000);
    }
  };

  const handleQuickInputDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed > 0) {
      playCoinSound();
      onDeposit(parsed, `Instant custom deposit`);
      setSuccessAnimation(parsed);
      setCustomAmount('');
      setTimeout(() => setSuccessAnimation(null), 1000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4.5 border border-stone-100 shadow-sm relative overflow-hidden">
      {/* Locked Empty State Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-1 shadow-sm">
            <Coins className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <span className="text-[11px] font-bold text-stone-700 tracking-tight">Deposit Drawer Locked</span>
          <p className="text-[9.5px] text-stone-450 max-w-[190px] mt-0.5 leading-relaxed font-semibold">
            Create a Saving Vault target under the <strong className="text-stone-705">"Set Goal"</strong> menu first to unlock deposits!
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-3.5">
        <div>
          <h3 className="font-bold text-stone-850 text-[12.5px] tracking-tight flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            Tactile Fast-Save Deposit
          </h3>
          <p className="text-[10px] text-stone-400 mt-0.5">Drag any coin into the vault to save instantly</p>
        </div>
        <span className="text-[8.5px] bg-stone-50 border border-stone-100 text-stone-550 font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider">
          Gesture Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Side: Drag Zone */}
        <div className="md:col-span-7 flex flex-col items-center">
          {/* Target Piggy Bank Pad */}
          <motion.div
            ref={dropZoneRef}
            className={`w-full max-w-[190px] aspect-[16/10] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all relative overflow-hidden ${
              isOver 
                ? 'bg-amber-50/70 border-amber-400 scale-[1.01] shadow-[0_8px_20px_rgba(245,158,11,0.08)]' 
                : 'bg-stone-50/50 border-stone-200/80 hover:border-stone-355'
            }`}
            animate={{
              borderColor: isOver ? '#f59e0b' : '#e7e5e4',
              color: isOver ? '#d97706' : '#78716c',
            }}
          >
            {/* Elegant Sparkle Animation */}
            <AnimatePresence>
              {successAnimation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.2, y: -20 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/5 backdrop-blur-[1px]"
                >
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </motion.div>
                  <span className="text-xs font-bold text-stone-805 mt-1">+₱{successAnimation} Saved!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="flex flex-col items-center pointer-events-none"
              animate={{ 
                scale: isOver ? 1.05 : 1,
                y: isOver ? -1 : 0
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {/* Vault / Slot Illustration and indicator */}
              <div className="relative mb-1.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-inner ${
                  isOver ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                  </svg>
                </div>
                {/* Visual coin channel indicator */}
                <span className={`absolute -top-0.5 left-9 w-1.5 h-1.5 rounded-full ${isOver ? 'bg-amber-400 animate-ping' : 'bg-transparent'}`} />
              </div>

              <span className="text-[11px] font-bold text-stone-700">Drop Vault</span>
              <span className="text-[9px] text-stone-400 mt-0.5 font-semibold max-w-[120px] text-center line-clamp-1">
                for {activeGoalName}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Coins List Container */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="text-center md:text-left w-full mb-2">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Available Tokens</span>
          </div>

          <div className="flex flex-row md:flex-col gap-3 justify-center items-center w-full">
            {coinOptions.map((coin, index) => (
              <div key={index} className="relative z-10 touch-none">
                {/* We render a static visual ghost slot behind the draggable coin */}
                <div className="absolute inset-0 rounded-full border border-stone-100 bg-stone-50 scale-95 pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] font-bold text-stone-300">₱{coin.value}</span>
                </div>

                <motion.div
                  drag
                  dragElastic={0.65}
                  dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  onDrag={handleDrag}
                  onDragEnd={(e, info) => handleDragEnd(e, info, coin.value)}
                  whileDrag={{ scale: 1.15, zIndex: 100, cursor: 'grabbing', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ 
                    y: { 
                      repeat: Infinity, 
                      duration: 2.5 + index * 0.3, 
                      ease: "easeInOut" 
                    }
                  }}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center cursor-grab text-[11px] font-semibold tracking-tight select-none select-none transition-shadow ${coin.color} text-center`}
                  style={{ touchAction: 'none' }}
                >
                  ₱{coin.value}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
