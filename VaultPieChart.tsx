import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PieChart, PiggyBank, Target, HelpCircle } from 'lucide-react';
import { Goal } from '../types';

interface VaultPieChartProps {
  goals: Goal[];
}

export default function VaultPieChart({ goals }: VaultPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter out goals with active funds
  const activeFundingGoals = goals.filter(g => g.currentAmount > 0);
  const totalSavedAcrossVaults = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  // Map colors to nice sleek hex codes
  const colorMap: Record<string, { color: string; hex: string; bg: string; dot: string }> = {
    amber: { color: 'text-amber-500', hex: '#d97706', bg: 'bg-amber-500', dot: 'bg-amber-400' },
    blue: { color: 'text-blue-500', hex: '#2563eb', bg: 'bg-blue-500', dot: 'bg-blue-400' },
    emerald: { color: 'text-emerald-500', hex: '#059669', bg: 'bg-emerald-500', dot: 'bg-emerald-400' },
    purple: { color: 'text-purple-500', hex: '#7c3aed', bg: 'bg-purple-500', dot: 'bg-purple-400' },
    rose: { color: 'text-rose-500', hex: '#e11d48', bg: 'bg-rose-500', dot: 'bg-rose-400' },
  };

  const getStyleProps = (colorName: string) => {
    return colorMap[colorName] || { color: 'text-stone-500', hex: '#78716c', bg: 'bg-stone-500', dot: 'bg-stone-400' };
  };

  // SVG Geometry for Donut Chart
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~314.159

  // Calculate coordinates and accumulative dash spacing
  let currentOffset = 0;
  
  const slices = activeFundingGoals.map((goal, idx) => {
    const amount = goal.currentAmount;
    const percentage = amount / totalSavedAcrossVaults;
    const dashArrayValue = percentage * circumference;
    const dashOffsetValue = currentOffset;
    
    // Increment accumulated offset
    currentOffset -= dashArrayValue;

    return {
      goal,
      index: idx,
      amount,
      percentage: Math.round(percentage * 100),
      dashArray: `${dashArrayValue} ${circumference}`,
      dashOffset: dashOffsetValue,
      style: getStyleProps(goal.color)
    };
  });

  // Determine active detailed content to present in the center circle of the donut
  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white/95 rounded-3xl p-5 border border-stone-100 shadow-sm transition-all duration-300">
      {/* Header and subtitle */}
      <div className="flex items-center justify-between mb-4.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50/70 text-orange-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-stone-400 leading-none mb-1">Vault Allocation</h4>
            <span className="text-[10.5px] text-stone-400 font-semibold leading-none">Fund distribution across your savings targets</span>
          </div>
        </div>
      </div>

      {totalSavedAcrossVaults === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="relative w-28 h-28 mb-3.5 flex items-center justify-center">
            {/* Empty state donut ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#f5f5f4"
                strokeWidth={strokeWidth}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <PiggyBank className="w-6 h-6 text-stone-300" />
            </div>
          </div>
          <span className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wide">Ready for micro-savings! 🏁</span>
          <p className="text-[10px] text-stone-400 mt-1 max-w-[200px] leading-normal">
            No active vaults have saved funds yet. Fund your goals to see the pie chart slice distribution!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-12 gap-5 items-center">
          {/* Interactive Donut Graphic */}
          <div className="xs:col-span-5 flex justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 select-none" viewBox="0 0 120 120">
                {/* Background full shadow ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#FAF9F5"
                  strokeWidth={strokeWidth + 1}
                />
                
                {slices.map((slice) => (
                  <motion.circle
                    key={slice.goal.id}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={slice.style.hex}
                    strokeWidth={hoveredIndex === slice.index ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                    strokeLinecap="round"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      filter: hoveredIndex === slice.index ? `drop-shadow(0px 0px 4px ${slice.style.hex}80)` : 'none'
                    }}
                  />
                ))}
              </svg>

              {/* Dynamic center hover indicator display text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                {activeSlice ? (
                  <div className="animate-fade-in">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block truncate max-w-[80px]">
                      {activeSlice.goal.name}
                    </span>
                    <span className="text-sm font-black font-mono text-stone-850 leading-none block mt-0.5">
                      {activeSlice.percentage}%
                    </span>
                    <span className="text-[8px] font-medium text-stone-400 block mt-0.5 truncate max-w-[80px]">
                      ₱{activeSlice.amount.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-stone-400 block">
                      Total Saved
                    </span>
                    <span className="text-sm font-black font-mono text-stone-850 leading-none block mt-0.5">
                      ₱{totalSavedAcrossVaults.toLocaleString()}
                    </span>
                    <span className="text-[8px] font-semibold text-stone-400 block mt-0.5 capitalize">
                      {slices.length} active vaults
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Legends Display */}
          <div className="xs:col-span-7 space-y-1.5 self-center">
            {slices.map((slice) => (
              <div
                key={slice.goal.id}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-xl flex items-center justify-between border transition-all duration-150 cursor-pointer ${
                  hoveredIndex === slice.index 
                    ? 'bg-stone-50 border-stone-200 shadow-sm scale-[1.01]' 
                    : 'bg-white/40 border-transparent hover:bg-stone-50/20'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${slice.style.dot} flex-shrink-0`} />
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-stone-800 block truncate leading-tight">
                      {slice.goal.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block leading-none mt-0.5">
                      {slice.percentage}% allocation
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-black font-mono tracking-tight text-stone-855 block">
                    ₱{slice.amount.toLocaleString()}
                  </span>
                  <span className="text-[8.5px] text-stone-405 block font-semibold leading-none mt-0.5">
                    target: ₱{slice.goal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
