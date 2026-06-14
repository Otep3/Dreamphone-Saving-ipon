import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Coins, ShieldCheck, Star } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  conditionDesc: string;
  emoji: React.ReactNode;
  isUnlocked: boolean;
  score?: string;
}

interface AchievementsGridProps {
  goals: { currentAmount: number; targetAmount: number; streak: number }[];
  totalSaved: number;
}

export default function AchievementsGrid({ goals, totalSaved }: AchievementsGridProps) {
  const hasFirstDeposit = totalSaved > 0;
  const hasStreak = goals.some((g) => g.streak >= 7);
  const highestStreak = goals.reduce((max, g) => (g.streak > max ? g.streak : max), 0);
  const halfWayMilestone = goals.some((g) => g.currentAmount / g.targetAmount >= 0.5);
  const goalCrusherMilestone = goals.some((g) => g.currentAmount / g.targetAmount >= 1.0);
  const masterSaverMilestone = totalSaved >= 50000;

  const achievements: Achievement[] = [
    {
      id: 'first_deposit',
      name: 'First Deposit',
      desc: 'Deposited into your dream vault.',
      conditionDesc: 'Logged at least 1 transaction',
      emoji: <Coins className="w-5 h-5 text-amber-600" />,
      isUnlocked: hasFirstDeposit,
      score: hasFirstDeposit ? 'Unlocked' : '0/1'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      desc: 'Active saving streak of 7+ days!',
      conditionDesc: 'Maintain savings behavior',
      emoji: <Flame className="w-5 h-5 text-red-500 animate-pulse" />,
      isUnlocked: hasStreak,
      score: `${highestStreak}/7 days`
    },
    {
      id: 'halfway',
      name: 'Halfway Hero',
      desc: 'Reached 50% on any target goal.',
      conditionDesc: 'Patience paid off',
      emoji: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      isUnlocked: halfWayMilestone,
      score: halfWayMilestone ? 'Unlocked' : '50% progress'
    },
    {
      id: 'crusher',
      name: 'Goal Crusher',
      desc: 'Hit 100% on a target device!',
      conditionDesc: 'Redeem your target dream',
      emoji: <Trophy className="w-5 h-5 text-yellow-500" />,
      isUnlocked: goalCrusherMilestone,
      score: goalCrusherMilestone ? 'Claimed' : '0/1 Complete'
    },
    {
      id: 'master_saver',
      name: 'Master Saver',
      desc: 'Reached ₱50,000 total lifetime savings!',
      conditionDesc: 'Massive milestone',
      emoji: <Star className="w-5 h-5 text-purple-600" />,
      isUnlocked: masterSaverMilestone,
      score: `${Math.round(Math.min(totalSaved, 50000)).toLocaleString()}/₱50,000`
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-stone-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Medals & Achievements</h4>
          <span className="text-lg font-bold text-stone-850">Level {achievements.filter(a => a.isUnlocked).length + 1} Saver</span>
        </div>
        <span className="text-[10px] bg-stone-50 border border-stone-100 text-stone-500 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
          {achievements.filter((a) => a.isUnlocked).length} / {achievements.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 select-none gap-3.5 sm:grid-cols-2">
        {achievements.map((ach) => (
          <motion.div
            key={ach.id}
            whileHover={{ y: -1.5 }}
            className={`flex items-center gap-4.5 p-3.5 rounded-2xl border transition-all ${
              ach.isUnlocked
                ? 'bg-[#FAF9F5]/40 border-stone-200 shadow-sm'
                : 'bg-stone-50/50 border-stone-100 opacity-55 saturate-50'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              ach.isUnlocked ? 'bg-white shadow-sm border border-stone-100' : 'bg-stone-200/50'
            }`}>
              {ach.emoji}
            </div>

            <div className="flex-1 min-width-0">
              <h5 className="text-xs font-bold text-stone-800 leading-tight flex items-center gap-1">
                {ach.name}
              </h5>
              <p className="text-[10.5px] text-stone-400 mt-0.5 line-clamp-1">{ach.desc}</p>
              <div className="flex justify-between items-baseline mt-1.5">
                <span className="text-[9px] text-stone-400 font-mono italic leading-none">{ach.conditionDesc}</span>
                <span className={`text-[10px] font-mono font-bold leading-none ${ach.isUnlocked ? 'text-amber-600' : 'text-stone-400'}`}>
                  {ach.score}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
