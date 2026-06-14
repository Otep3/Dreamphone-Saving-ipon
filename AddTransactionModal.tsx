import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Sparkles, ArrowDownLeft, ArrowUpRight, Coins } from 'lucide-react';
import { Goal } from '../types';
import { playSlideSound, playPopSound } from '../utils/audio';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  onAddTransaction: (data: {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'savings';
    category: string;
    goalId?: string;
  }) => void;
}

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  goals, 
  onAddTransaction 
}: AddTransactionModalProps) {
  const [type, setType] = useState<'savings' | 'expense' | 'income'>('savings');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || '');

  // Synchronize first Selected Goal ID if goals loaded or selected goal was deleted
  React.useEffect(() => {
    if (goals.length > 0 && (!selectedGoalId || !goals.some(g => g.id === selectedGoalId))) {
      setSelectedGoalId(goals[0].id);
    } else if (goals.length === 0) {
      setSelectedGoalId('');
    }
  }, [goals, selectedGoalId]);

  const expenseCategories = [
    { name: 'Food & Groceries', color: 'rose' },
    { name: 'Transport', color: 'blue' },
    { name: 'Cafe & Eating Out', color: 'amber' },
    { name: 'Entertainment', color: 'purple' },
    { name: 'Bills & Utilities', color: 'emerald' },
    { name: 'Other', color: 'stone' },
  ];

  const incomeCategories = [
    { name: 'Salary', color: 'emerald' },
    { name: 'Freelance / Side Husk', color: 'indigo' },
    { name: 'Allowance', color: 'teal' },
    { name: 'Gift / Refund', color: 'amber' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount);
    if (!finalAmount || isNaN(finalAmount)) return;

    let finalCategory = category;
    let finalTitle = '';

    if (type === 'savings') {
      const g = goals.find(x => x.id === selectedGoalId);
      finalCategory = g ? `Vault contribution: ${g.name}` : 'Goal Vault';
      finalTitle = g ? `Saved towards ${g.name}` : 'Saved towards Goal';
    } else {
      if (!finalCategory) {
        finalCategory = 'Miscellaneous';
      }
      finalTitle = finalCategory;
    }

    onAddTransaction({
      title: finalTitle,
      amount: finalAmount,
      type,
      category: finalCategory,
      goalId: type === 'savings' ? selectedGoalId : undefined
    });

    playPopSound();
    
    // Reset form
    setAmount('');
    setTitle('');
    setCategory('');
    onClose();
  };

  // Sound feedback on type switch page
  const handleTypeChange = (newType: 'savings' | 'expense' | 'income') => {
    setType(newType);
    playSlideSound();
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

          {/* Drawer container (Slide-up or bottom sheet layout matching soft-white aesthetic) */}
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-stone-850 tracking-tight">Add New Activity</h3>
                  <p className="text-xs text-stone-400">Swipe down this drawer card to dismiss</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 text-stone-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector Tabs for transaction type */}
              <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => handleTypeChange('savings')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    type === 'savings' 
                      ? 'bg-white text-emerald-800 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  Save Ipon
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-white text-rose-800 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    type === 'income' 
                      ? 'bg-white text-stone-800 shadow-sm' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Income
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Value Enter Box (Big responsive design input) */}
                <div className="bg-stone-50/55 rounded-2xl p-4 border border-stone-100 text-center relative">
                  <span className="text-xs font-semibold text-stone-400 block mb-1 uppercase tracking-wider">Amount (₱)</span>
                  <div className="flex justify-center items-center gap-1">
                    <span className="text-3xl font-extrabold text-stone-500">₱</span>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-4xl font-extrabold focus:outline-none bg-transparent text-stone-800 w-48 text-center placeholder-stone-200"
                      min="1"
                      step="any"
                      autoFocus
                    />
                  </div>
                </div>


                {/* 3a. If Savings, Choose destination Goal Vault */}
                {type === 'savings' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wider">
                      Select Goal Vault
                    </label>
                    {goals.length === 0 ? (
                      <div className="bg-stone-50 border border-dashed border-stone-200/80 rounded-2xl p-5 text-center">
                        <span className="text-lg block">🎯</span>
                        <p className="text-[11px] text-stone-400 mt-1 max-w-[210px] mx-auto leading-relaxed">
                          No saving vaults set up. Please launch a vault target first under the <strong className="text-stone-600">"Set Goal"</strong> menu!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {goals.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setSelectedGoalId(g.id)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                              selectedGoalId === g.id
                                ? 'bg-amber-50/20 border-amber-400/80 ring-2 ring-amber-500/10'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <h5 className="text-xs font-bold text-stone-800">{g.name}</h5>
                              <span className="text-[10px] text-stone-400 font-mono">Target: ₱{g.targetAmount.toLocaleString()}</span>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-stone-700 block">₱{g.currentAmount.toLocaleString()}</span>
                              <span className="text-[10px] text-stone-400 bg-stone-55 px-2 py-0.5 rounded-full font-bold">
                                {Math.round((g.currentAmount / g.targetAmount) * 100)}%
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3b. If Expense, choose Category Bubble */}
                {type === 'expense' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wider">
                      Spending Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {expenseCategories.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={`py-3 px-4 rounded-2xl border cursor-pointer text-xs font-bold text-center transition-all ${
                            category === cat.name
                              ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3c. If Income, choose Category Bubble */}
                {type === 'income' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-600 block mb-1.5 uppercase tracking-wider">
                      Income Stream Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {incomeCategories.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={`py-3 px-4 rounded-2xl border cursor-pointer text-xs font-bold text-center transition-all ${
                            category === cat.name
                              ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold py-4 px-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-stone-900/10 active:scale-[0.98] text-sm mt-3.5 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Post Activity Action
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
