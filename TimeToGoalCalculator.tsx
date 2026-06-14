import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, TrendingUp, Sparkles, HelpCircle, AlertCircle, Ship, Compass, ArrowRight, Hourglass } from 'lucide-react';
import { Goal, Transaction } from '../types';
import { playPopSound } from '../utils/audio';

interface TimeToGoalCalculatorProps {
  goal: Goal;
  transactions: Transaction[];
  themeVibe?: 'golden' | 'cosmic' | 'sage' | 'sakura';
}

export default function TimeToGoalCalculator({ goal, transactions, themeVibe = 'golden' }: TimeToGoalCalculatorProps) {
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customDailyRate, setCustomDailyRate] = useState<number>(100);
  const [showInsight, setShowInsight] = useState(false);

  // Remaining saving target
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Calculate real average daily savings rate for this goal
  const calculatedRate = React.useMemo(() => {
    const goalTx = transactions.filter(t => t.type === 'savings' && t.goalId === goal.id);
    if (goalTx.length === 0) {
      const anySavingsTx = transactions.filter(t => t.type === 'savings');
      if (anySavingsTx.length === 0) return 0;

      const totalOverallSaved = anySavingsTx.reduce((sum, t) => sum + t.amount, 0);
      let minD = Date.now();
      let maxD = Date.now();
      anySavingsTx.forEach(t => {
        const d = new Date(t.date).getTime();
        if (!isNaN(d)) {
          if (d < minD) minD = d;
          if (d > maxD) maxD = d;
        }
      });
      const diffD = Math.ceil(Math.abs(maxD - minD) / (1000 * 60 * 60 * 24));
      if (diffD <= 1) {
        return Math.max(20, Math.round(totalOverallSaved / anySavingsTx.length));
      }
      return Math.max(10, Math.round(totalOverallSaved / diffD));
    }

    const totalSavedGoal = goalTx.reduce((sum, t) => sum + t.amount, 0);
    let minDate = Date.now();
    let maxDate = Date.now();
    goalTx.forEach(t => {
      const d = new Date(t.date).getTime();
      if (!isNaN(d)) {
        if (d < minDate) minDate = d;
        if (d > maxDate) maxDate = d;
      }
    });

    const diffDays = Math.ceil(Math.abs(maxDate - minDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      const avgDeposit = totalSavedGoal / goalTx.length;
      return Math.max(10, Math.round(avgDeposit / 7));
    }

    return Math.max(1, Math.round(totalSavedGoal / diffDays));
  }, [transactions, goal.id]);

  // Determine active rate to use
  const activeRate = useCustomRate ? customDailyRate : (calculatedRate || 100);

  // Calculate days remaining
  const daysToReach = activeRate > 0 ? Math.ceil(remainingAmount / activeRate) : 9999;

  // Calculate destination date
  const targetReachDate = React.useMemo(() => {
    if (remainingAmount <= 0) return 'Fully Saved!';
    if (daysToReach >= 9999) return 'Never (0 savings rate)';
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToReach);
    
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [remainingAmount, daysToReach]);

  // Faster rate analysis for dynamic insights banner
  const optimalUpgradedRate = Math.round(activeRate * 1.35);
  const upgradedDaysToReach = activeRate > 0 ? Math.ceil(remainingAmount / optimalUpgradedRate) : 9999;
  const daysSaved = daysToReach > upgradedDaysToReach ? (daysToReach - upgradedDaysToReach) : 0;

  useEffect(() => {
    if (calculatedRate > 0) {
      setCustomDailyRate(calculatedRate);
    } else {
      setCustomDailyRate(100);
    }
  }, [calculatedRate]);

  // Aesthetic mapping based on current vibe
  const themeColors = {
    cosmic: {
      card: 'bg-stone-900 border-stone-850 text-stone-100',
      textMuted: 'text-stone-400',
      textTitle: 'text-stone-200',
      badgeBg: 'bg-indigo-500/15 text-indigo-300',
      btnToggle: 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-800',
      gridBg: 'bg-stone-950/80 border-stone-850',
      sliderBg: 'bg-stone-950 border-stone-850',
      accentText: 'text-indigo-400',
      sliderAccent: 'accent-indigo-500',
      tipBg: 'bg-indigo-500/10 border-indigo-500/15 text-[#93C5FD]',
      starColor: 'text-indigo-300',
      iconContainer: 'bg-indigo-500/10 text-indigo-400',
    },
    sage: {
      card: 'bg-white border-[#E3ECE7] text-[#1F3329]',
      textMuted: 'text-[#5A6E64]',
      textTitle: 'text-[#1F3329]',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
      btnToggle: 'bg-stone-50 hover:bg-stone-100 text-[#5A6E64] border-stone-200/80',
      gridBg: 'bg-[#F2F5F3] border-[#DFE5E1]',
      sliderBg: 'bg-[#F9FAF9] border-[#DFE5E1]',
      accentText: 'text-emerald-700',
      sliderAccent: 'accent-emerald-600',
      tipBg: 'bg-emerald-500/10 border-emerald-500/15 text-emerald-850',
      starColor: 'text-emerald-500',
      iconContainer: 'bg-emerald-50 text-[#1F3329]',
    },
    sakura: {
      card: 'bg-white border-[#FAE6E6] text-[#3B1919]',
      textMuted: 'text-[#8C5A5A]',
      textTitle: 'text-[#3B1919]',
      badgeBg: 'bg-rose-50 text-rose-800 border border-rose-100',
      btnToggle: 'bg-rose-50/40 hover:bg-rose-50 text-[#8C5A5A] border-rose-100',
      gridBg: 'bg-[#FFF9F9] border-[#F8E3E3]',
      sliderBg: 'bg-[#FFFCFC] border-[#F8E3E3]',
      accentText: 'text-rose-600',
      sliderAccent: 'accent-rose-500',
      tipBg: 'bg-rose-500/10 border-rose-500/15 text-rose-900',
      starColor: 'text-rose-400',
      iconContainer: 'bg-rose-50 text-[#3B1919]',
    },
    golden: {
      card: 'bg-white border-stone-100 text-stone-850',
      textMuted: 'text-stone-400',
      textTitle: 'text-stone-800',
      badgeBg: 'bg-amber-50 text-amber-800 border border-amber-150',
      btnToggle: 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200/60',
      gridBg: 'bg-[#FAF9F5]/40 border-stone-150',
      sliderBg: 'bg-stone-50 border-stone-150',
      accentText: 'text-amber-600',
      sliderAccent: 'accent-amber-500',
      tipBg: 'bg-amber-500/10 border-amber-500/15 text-amber-900',
      starColor: 'text-amber-500',
      iconContainer: 'bg-amber-50 text-amber-700',
    }
  }[themeVibe] || {
    card: 'bg-white border-stone-100 text-stone-850',
    textMuted: 'text-stone-400',
    textTitle: 'text-stone-800',
    badgeBg: 'bg-amber-50 text-amber-800 border border-amber-150',
    btnToggle: 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200/60',
    gridBg: 'bg-[#FAF9F5]/40 border-stone-150',
    sliderBg: 'bg-stone-50 border-stone-150',
    accentText: 'text-amber-600',
    sliderAccent: 'accent-amber-500',
    tipBg: 'bg-amber-500/10 border-amber-500/15 text-amber-950',
    starColor: 'text-amber-500',
    iconContainer: 'bg-amber-50 text-amber-700',
  };

  if (remainingAmount <= 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-center text-emerald-600">
        <span className="text-[10px] font-black uppercase tracking-widest block leading-none mb-1">Goal Reached! 🌟</span>
        <p className="text-[10px] font-semibold">Your savings match the target. Excellent micro-saving discipline!</p>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 ${themeColors.card} shadow-sm space-y-3.5 relative overflow-hidden`}>
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${themeColors.iconContainer}`}>
            <Hourglass className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 leading-none mb-1">Savings Forecast</h4>
            <span className="text-[10px] text-stone-400 font-semibold leading-none">Estimate target accomplishment</span>
          </div>
        </div>
        
        {/* Toggle Mode */}
        <button
          type="button"
          onClick={() => {
            setUseCustomRate(!useCustomRate);
            playPopSound();
          }}
          className={`px-2.5 py-1.5 rounded-full text-[9.5px] font-bold border transition-all active:scale-95 cursor-pointer ${themeColors.btnToggle}`}
        >
          {useCustomRate ? '🔄 Set Auto' : '🎚️ Simulate'}
        </button>
      </div>

      {/* Numerical Indicators Grid */}
      <div className="grid grid-cols-2 gap-3.5 text-center">
        <div className={`p-3 rounded-2xl border ${themeColors.gridBg}`}>
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-stone-400 block leading-none mb-1.5">
            Days Required
          </span>
          <span className="text-sm font-black font-mono text-amber-500 block leading-snug">
            {daysToReach >= 9999 ? '∞' : `${daysToReach} Days`}
          </span>
          <span className="text-[9px] text-[#A8A29E] font-medium">
            at ₱{activeRate}/day
          </span>
        </div>

        <div className={`p-3 rounded-2xl border ${themeColors.gridBg} flex flex-col justify-center`}>
          <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-stone-400 block leading-none mb-1.5">
            Target Completion
          </span>
          <span className={`text-[12.5px] font-black block leading-snug truncate ${themeColors.accentText}`}>
            {targetReachDate}
          </span>
          <span className="text-[9px] text-[#A8A29E] font-medium flex items-center justify-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3 text-[#A8A29E]" />
            Calendar Date
          </span>
        </div>
      </div>

      {/* Simulator Range input slider */}
      {useCustomRate && (
        <div className={`p-3.5 rounded-2xl border space-y-2 ${themeColors.sliderBg}`}>
          <div className="flex justify-between items-center text-[9px]">
            <span className="font-extrabold text-[#A8A29E] uppercase tracking-wide">Adjust simulated daily save:</span>
            <span className="font-mono font-black border border-stone-200/50 px-2 py-0.5 rounded-lg text-amber-600 bg-amber-500/5">
              ₱{customDailyRate}/day
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="1500"
            step="10"
            value={customDailyRate}
            onChange={(e) => setCustomDailyRate(parseInt(e.target.value, 10))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${themeColors.sliderAccent}`}
          />
          <div className="flex justify-between text-[8px] text-stone-400 font-mono font-bold px-0.5">
            <span>₱10/day</span>
            <span>₱500</span>
            <span>₱1k</span>
            <span>₱1.5k/day</span>
          </div>
        </div>
      )}

      {/* Dynamic tips and automated average advice */}
      {!useCustomRate && (
        <div className="flex items-center justify-between text-[9px] bg-stone-50/70 border border-stone-150/60 px-3 py-2 rounded-2xl gap-1.5">
          <div className="min-w-0">
            {calculatedRate === 0 ? (
              <span className="text-stone-400 font-semibold leading-tight line-clamp-1">
                ⚠️ No savings history yet. Save to calculate real-time rate!
              </span>
            ) : (
              <span className="text-stone-500 font-semibold leading-tight line-clamp-1">
                📈 Historical Average: <strong className="text-emerald-600 font-mono font-bold">₱{calculatedRate}/day</strong>
              </span>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => {
              setShowInsight(!showInsight);
              playPopSound();
            }}
            className="text-[9px] font-black text-amber-500 shrink-0 hover:underline cursor-pointer"
          >
            {showInsight ? 'Hide Tip' : 'Show Tip ✨'}
          </button>
        </div>
      )}

      {/* Micro dynamic advice text */}
      <AnimatePresence>
        {((showInsight && !useCustomRate) || (useCustomRate && daysSaved > 0)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`p-3 rounded-2xl text-[10px] leading-relaxed flex gap-2 items-start ${themeColors.tipBg}`}>
              <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${themeColors.starColor}`} />
              <div>
                <strong className="block font-black uppercase text-[8.5px] tracking-wide mb-0.5">Accelerator Hack! 🚀</strong>
                If you save just <strong className="font-mono font-bold">₱{useCustomRate ? optimalUpgradedRate : Math.round((activeRate || 100) * 1.3)}/day</strong> instead, you will hit your goal <strong className="font-mono font-bold text-amber-600">{useCustomRate ? daysSaved : Math.ceil(daysToReach * 0.23)} days faster!</strong> Try scaling down daily minor expenses (cafe, transit) today.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
