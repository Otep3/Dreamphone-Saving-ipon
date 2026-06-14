import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CustomChartProps {
  type: 'line' | 'bar';
  savingsData?: number[];
  expenseData?: number[];
  labels?: string[];
  height?: number;
  totalSavings?: number;
  savingsRate?: number;
  weeklyData?: { label: string; value: number }[];
}

export default function CustomChart({ 
  type, 
  savingsData = [12000, 14000, 15500, 17000, 18450], 
  expenseData = [8000, 9500, 8000, 10000, 8500],
  labels = ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
  height = 160,
  totalSavings,
  savingsRate,
  weeklyData = [
    { label: 'Mon', value: 280 },
    { label: 'Tue', value: 420 },
    { label: 'Wed', value: 160 },
    { label: 'Thu', value: 540 },
    { label: 'Fri', value: 380 },
    { label: 'Sat', value: 720 },
    { label: 'Sun', value: 240 },
  ]
}: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (type === 'bar') {
    const totalWeeklySpent = weeklyData.reduce((acc, d) => acc + d.value, 0);
    const maxVal = Math.max(...weeklyData.map(d => d.value), 100);

    return (
      <div className="bg-white/90 rounded-3xl p-5 border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Daily Expenditures</h4>
            <span className="text-xl font-bold font-mono tracking-tight text-stone-800">
              ₱{totalWeeklySpent.toLocaleString()} <span className="text-xs text-stone-400 font-sans font-medium">this week</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold">
            Active spending distribution
          </span>
        </div>

        <div className="flex items-end justify-between gap-2.5 pt-4 h-[140px]">
          {weeklyData.map((d, idx) => {
            const percentage = (d.value / maxVal) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Custom popup tooltip */}
                <span className="absolute -top-8 bg-stone-900 text-stone-50 px-2 py-0.5 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-md">
                  ₱{d.value}
                </span>
                
                {/* Animated bar column with motion */}
                <div className="w-full h-[100px] flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20, delay: idx * 0.05 }}
                    className={`w-full rounded-t-xl transition-all ${
                      d.value > 450 
                        ? 'bg-amber-400/80 hover:bg-amber-400' 
                        : 'bg-stone-200/80 hover:bg-stone-300'
                    }`}
                  />
                </div>
                
                <span className="text-[10px] font-semibold text-stone-400 group-hover:text-stone-700 transition-colors uppercase font-mono">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Savings vs Expenses Line Area Chart using vanilla responsive SVG with state/transitions
  const max = Math.max(...savingsData, ...expenseData, 100) * 1.15;
  const min = 0;
  
  // Calculate SVG coordinates
  const width = 340;
  const gridLinesCount = 3;
  const paddingX = 15;
  const paddingY = 20;

  const pointsSavings = savingsData.map((val, idx) => {
    const x = paddingX + (idx / (savingsData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2);
    return { x, y, value: val };
  });

  const pointsExpenses = expenseData.map((val, idx) => {
    const x = paddingX + (idx / (expenseData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2);
    return { x, y, value: val };
  });

  // Convert points to SVG Path strings with smooth curved lines
  const getCurvePath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = arr[i - 1];
      const cpX1 = prev.x + (point.x - prev.x) / 3;
      const cpY1 = prev.y;
      const cpX2 = prev.x + 2 * (point.x - prev.x) / 3;
      const cpY2 = point.y;
      return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${point.x},${point.y}`;
    }, '');
  };

  const lineSavings = getCurvePath(pointsSavings);
  const lineExpenses = getCurvePath(pointsExpenses);

  const areaSavings = pointsSavings.length > 0 
    ? `${lineSavings} L ${pointsSavings[pointsSavings.length - 1].x},${height - paddingY} L ${pointsSavings[0].x},${height - paddingY} Z` 
    : '';
  
  const areaExpenses = pointsExpenses.length > 0 
    ? `${lineExpenses} L ${pointsExpenses[pointsExpenses.length - 1].x},${height - paddingY} L ${pointsExpenses[0].x},${height - paddingY} Z` 
    : '';

  const computedTotalSavings = totalSavings !== undefined ? totalSavings : (savingsData.length > 0 ? savingsData[savingsData.length - 1] : 0);
  const latestExpense = expenseData.length > 0 ? expenseData[expenseData.length - 1] : 0;
  const computedRate = savingsRate !== undefined ? savingsRate : (computedTotalSavings + latestExpense > 0 ? Math.round((computedTotalSavings / (computedTotalSavings + latestExpense)) * 100) : 0);

  return (
    <div className="bg-white/90 rounded-3xl p-5 border border-stone-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Savings Rate</h4>
          <span className="text-xl font-bold tracking-tight text-stone-800 flex items-center gap-1">
            ₱{computedTotalSavings.toLocaleString()} 
            <span className="text-xs text-stone-400 font-normal border-l border-stone-200 pl-1.5 ml-1.5">total saved</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 animate-pulse">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            {computedRate}% Saved Rate
          </span>
        </div>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        {/* SVG Wrapper with Responsive viewBox */}
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: gridLinesCount }).map((_, idx) => {
            const y = paddingY + (idx / (gridLinesCount - 1)) * (height - paddingY * 2);
            return (
              <line 
                key={idx} 
                x1={0} 
                y1={y} 
                x2={width} 
                y2={y} 
                stroke="#6c757d" 
                strokeOpacity="0.06" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Gradients */}
          {areaSavings && (
            <motion.path 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              d={areaSavings} 
              fill="url(#savingsGrad)" 
            />
          )}
          {areaExpenses && (
            <motion.path 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              d={areaExpenses} 
              fill="url(#expenseGrad)" 
            />
          )}

          {/* Smooth Line Paths */}
          {lineSavings && (
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              d={lineSavings} 
              fill="none" 
              stroke="#22C55E" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          )}
          {lineExpenses && (
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
              d={lineExpenses} 
              fill="none" 
              stroke="#FBBF24" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          )}

          {/* Interaction Circles on hover & latest point highlighting */}
          {pointsSavings.map((pt, idx) => (
            <g key={`savings-pt-${idx}`} className="group/pt">
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={idx === pointsSavings.length - 1 || hoveredIndex === idx ? 5 : 0} 
                fill="#22C55E" 
                stroke="#FFFFFF" 
                strokeWidth="2"
                onClick={() => setHoveredIndex(idx)}
                className="transition-all duration-150 cursor-pointer"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={16}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            </g>
          ))}

          {pointsExpenses.map((pt, idx) => (
            <g key={`expense-pt-${idx}`} className="group/pt-exp">
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={hoveredIndex === idx ? 5 : 0} 
                fill="#FBBF24" 
                stroke="#FFFFFF" 
                strokeWidth="2"
                className="transition-all duration-150"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={16}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl px-3 py-2 shadow-lg text-[11px] flex flex-col gap-0.5 pointer-events-none z-10 transition-all">
            <span className="text-stone-400 text-[10px] font-mono border-b border-stone-800 pb-1 mb-1 font-semibold">{labels[hoveredIndex]} 2026</span>
            <div className="flex justify-between items-center gap-5">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Saved:</span>
              <span className="font-mono font-bold">₱{savingsData[hoveredIndex].toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-5">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>Spent:</span>
              <span className="font-mono font-bold text-amber-300">₱{expenseData[hoveredIndex].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid Legend labels */}
      <div className="flex justify-between items-center border-t border-stone-50 pt-3.5 mt-2">
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-stone-400">
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-50/50 bg-emerald-500" />
            Savings
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-stone-400">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-50/50 bg-amber-400" />
            Expense
          </span>
        </div>
        
        <div className="flex gap-4 font-mono font-semibold text-[10px] text-stone-400">
          {labels.map((l, i) => (
            <span key={i} className={hoveredIndex === i ? 'text-stone-800' : ''}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
