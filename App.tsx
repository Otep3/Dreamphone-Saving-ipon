import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Flame, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  ArrowDownRight, 
  ArrowUpRight, 
  TrendingUp, 
  Trophy, 
  CreditCard, 
  BarChart3, 
  Trash2, 
  PlusCircle, 
  Smile, 
  BookOpen, 
  Calendar,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  Camera,
  HelpCircle,
  Palette,
  MoreVertical,
  User,
  Edit2
} from 'lucide-react';

import { Goal, Transaction, Budget } from './types';
import DropPiggyBank from './components/DropPiggyBank';
import CustomChart from './components/CustomChart';
import AchievementsGrid from './components/AchievementsGrid';
import AddTransactionModal from './components/AddTransactionModal';
import AddGoalModal from './components/AddGoalModal';
import VaultPieChart from './components/VaultPieChart';
import OnboardingSlider from './components/OnboardingSlider';
import SavingsReminderCard from './components/SavingsReminderCard';
import { playSlideSound, playPopSound, playSuccessSound } from './utils/audio';

// Seed Initial Data Helper
const DEFAULT_GOALS: Goal[] = [];

const DEFAULT_TRANSACTIONS: Transaction[] = [];

const DEFAULT_BUDGET: Budget = {
  monthlyLimit: 0,
  categories: [],
};

const getCategoryEmoji = (name: string): string => {
  const norm = name.toLowerCase();
  if (norm.includes('food') || norm.includes('groc') || norm.includes('eat') || norm.includes('supermarket')) return '🍔';
  if (norm.includes('cafe') || norm.includes('coffee') || norm.includes('drink')) return '☕';
  if (norm.includes('transport') || norm.includes('car') || norm.includes('ride') || norm.includes('grab')) return '🚗';
  if (norm.includes('ent') || norm.includes('movie') || norm.includes('tv') || norm.includes('show')) return '🎬';
  if (norm.includes('bill') || norm.includes('utility') || norm.includes('zap') || norm.includes('elect')) return '⚡';
  if (norm.includes('shopping') || norm.includes('clothes')) return '🛍️';
  if (norm.includes('saving') || norm.includes('vault')) return '🔒';
  return '💸';
};

const PAGES = ['home', 'goals', 'analytics', 'profile'] as const;
type PageType = typeof PAGES[number];

export default function App() {
  const [activeTab, setActiveTab] = useState<PageType>('home');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget>(DEFAULT_BUDGET);
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile customization and aesthetic vibe states
  const [userName, setUserName] = useState('Maria Joy');
  const [userInitials, setUserInitials] = useState('MJ');
  const [themeVibe, setThemeVibe] = useState<'golden' | 'cosmic' | 'sage' | 'sakura'>('golden');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileInitials, setNewProfileInitials] = useState('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [undoState, setUndoState] = useState<{
    goals: Goal[];
    transactions: Transaction[];
    budget: Budget;
    message: string;
    secondsLeft: number;
  } | null>(null);

  // Countdown timer for Undo Notification
  useEffect(() => {
    if (!undoState) return;
    if (undoState.secondsLeft <= 0) {
      setUndoState(null);
      return;
    }
    const timer = setTimeout(() => {
      setUndoState(prev => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) return null;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [undoState]);

  // Execute undo restoring snapshots
  const handleUndo = () => {
    if (!undoState) return;
    saveGoals(undoState.goals);
    saveTransactions(undoState.transactions);
    saveBudget(undoState.budget);
    setUndoState(null);
    playSuccessSound();
    triggerToast("Action undone successfully! 💫");
  };
  
  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Toggle inline edit for target values
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTargetAmount, setTempTargetAmount] = useState('');
  const [editingGoalTargetId, setEditingGoalTargetId] = useState<string | null>(null);
  const [tempGoalTargetValue, setTempGoalTargetValue] = useState('');

  // New Onboarding guide and Custom budget states
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAlloc, setNewCategoryAlloc] = useState('');

  // Reset all data to clean starters
  const handleResetAllData = () => {
    playPopSound();
    
    localStorage.removeItem('dreamphone_goals_v5');
    localStorage.removeItem('dreamphone_transactions_v5');
    localStorage.removeItem('dreamphone_budget_v5');
    
    setGoals(DEFAULT_GOALS);
    setTransactions(DEFAULT_TRANSACTIONS);
    setBudget(DEFAULT_BUDGET);
    setActiveGoalIndex(0);
    
    localStorage.setItem('dreamphone_goals_v5', JSON.stringify(DEFAULT_GOALS));
    localStorage.setItem('dreamphone_transactions_v5', JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem('dreamphone_budget_v5', JSON.stringify(DEFAULT_BUDGET));
    
    triggerToast("System reset to pristine starter! ✨");
  };

  // Onboarding initialization callback values
  const handleOnboardingComplete = (data: {
    userName: string;
    userInitials: string;
    wantName: string;
    wantPrice: number;
    themeVibe: 'golden' | 'cosmic' | 'sage' | 'sakura';
  }) => {
    setUserName(data.userName);
    setUserInitials(data.userInitials);
    setThemeVibe(data.themeVibe);

    localStorage.setItem('dreamphone_username', data.userName);
    localStorage.setItem('dreamphone_initials', data.userInitials);
    localStorage.setItem('dreamphone_vibe', data.themeVibe);
    localStorage.setItem('dreamphone_onboarding_completed', 'true');

    // Automatically create the brand-new savings goal based on their custom want!
    const customGoal: Goal = {
      id: 'goal_' + Date.now(),
      name: data.wantName,
      targetAmount: data.wantPrice,
      currentAmount: 0,
      category: 'Primary',
      color: data.themeVibe === 'cosmic' ? 'blue' : data.themeVibe === 'sage' ? 'emerald' : data.themeVibe === 'sakura' ? 'rose' : 'amber',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toLocaleDateString(), // 6 months target
      streak: 0,
    };

    saveGoals([customGoal]);
    setActiveGoalIndex(0);

    setIsOnboardingOpen(false);
    triggerToast(`Created customized "${data.wantName}" micro-savings vault! 💰✨`);
  };

  // Load from LocalStorage
  useEffect(() => {
    const cachedGoals = localStorage.getItem('dreamphone_goals_v5');
    const cachedTransactions = localStorage.getItem('dreamphone_transactions_v5');
    const cachedBudget = localStorage.getItem('dreamphone_budget_v5');

    const cachedUsername = localStorage.getItem('dreamphone_username');
    const cachedInitials = localStorage.getItem('dreamphone_initials');
    const cachedVibe = localStorage.getItem('dreamphone_vibe');
    const hasCompletedOnboarding = localStorage.getItem('dreamphone_onboarding_completed') === 'true';

    if (cachedUsername) setUserName(cachedUsername);
    if (cachedInitials) setUserInitials(cachedInitials);
    if (cachedVibe) setThemeVibe(cachedVibe as any);

    if (cachedGoals) {
      setGoals(JSON.parse(cachedGoals));
    } else {
      setGoals(DEFAULT_GOALS);
      localStorage.setItem('dreamphone_goals_v5', JSON.stringify(DEFAULT_GOALS));
    }

    if (cachedTransactions) {
      setTransactions(JSON.parse(cachedTransactions));
    } else {
      setTransactions(DEFAULT_TRANSACTIONS);
      localStorage.setItem('dreamphone_transactions_v5', JSON.stringify(DEFAULT_TRANSACTIONS));
    }

    if (cachedBudget) {
      setBudget(JSON.parse(cachedBudget));
    } else {
      setBudget(DEFAULT_BUDGET);
      localStorage.setItem('dreamphone_budget_v5', JSON.stringify(DEFAULT_BUDGET));
    }

    // Open onboarding slider automatically for new users!
    if (!hasCompletedOnboarding) {
      setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 350);
    }
  }, []);

  // Sync state back to LocalStorage
  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem('dreamphone_goals_v5', JSON.stringify(updated));
  };

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('dreamphone_transactions_v5', JSON.stringify(updated));
  };

  const saveBudget = (updated: Budget) => {
    setBudget(updated);
    localStorage.setItem('dreamphone_budget_v5', JSON.stringify(updated));
  };

  // Helper trigger toast flash
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Switch tab page with audio tactile
  const handleTabSwitch = (category: PageType) => {
    if (activeTab === category) return;
    playSlideSound();
    setActiveTab(category);
  };

  // Swipe gesture handler
  const handleViewportDragEnd = (_event: any, info: any) => {
    const currentIdx = PAGES.indexOf(activeTab);
    const threshold = 80; // drag distance required
    
    if (info.offset.x > threshold && currentIdx > 0) {
      // Swiped right - go to previous page
      handleTabSwitch(PAGES[currentIdx - 1]);
    } else if (info.offset.x < -threshold && currentIdx < PAGES.length - 1) {
      // Swiped left - go to next page
      handleTabSwitch(PAGES[currentIdx + 1]);
    }
  };

  // Real deposit processor (gesture or modal)
  const depositFund = (amount: number, note: string) => {
    if (goals.length === 0) return;
    
    const activeGoal = goals[activeGoalIndex];
    const previousPercentage = Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100);

    const updatedGoals = goals.map((g, idx) => {
      if (idx === activeGoalIndex) {
        const nextAmount = g.currentAmount + amount;
        const depositStreak = g.streak + 1;
        return {
          ...g,
          currentAmount: Math.min(nextAmount, g.targetAmount),
          streak: depositStreak,
          lastDepositDate: new Date().toLocaleDateString()
        };
      }
      return g;
    });

    saveGoals(updatedGoals);

    // Save transaction
    const newTx: Transaction = {
      id: 'tx_added_' + Date.now(),
      goalId: activeGoal.id,
      title: note || `Contribution to ${activeGoal.name}`,
      amount,
      type: 'savings',
      date: 'Today · Just now',
      category: `Vault contribution: ${activeGoal.name}`
    };

    saveTransactions([newTx, ...transactions]);
    
    // Check if progress milestone reached
    const nextGoal = updatedGoals[activeGoalIndex];
    const newPercentage = Math.round((nextGoal.currentAmount / nextGoal.targetAmount) * 100);
    
    if (newPercentage >= 100 && previousPercentage < 100) {
      playSuccessSound();
      triggerToast(`🏆 HURRAY! You fully saved for ${activeGoal.name}!`);
    } else if (newPercentage >= 50 && previousPercentage < 50) {
      playSuccessSound();
      triggerToast(`🎉 50% SAVED! You reached halfway towards your dream!`);
    } else {
      triggerToast(`₱${amount} dropped into ${activeGoal.name}!`);
    }
  };

  // Add normal transaction
  const handleAddCustomTransaction = (data: {
    title: string;
    amount: number;
    type: 'income' | 'expense' | 'savings';
    category: string;
    goalId?: string;
  }) => {
    const newTx: Transaction = {
      id: 'tx_added_' + Date.now(),
      goalId: data.goalId,
      title: data.title,
      amount: data.amount,
      type: data.type,
      date: 'Today · Just now',
      category: data.category
    };

    saveTransactions([newTx, ...transactions]);

    // Update goals if saving
    if (data.type === 'savings' && data.goalId) {
      const updatedGoals = goals.map((g) => {
        if (g.id === data.goalId) {
          const result = g.currentAmount + data.amount;
          return {
            ...g,
            currentAmount: Math.min(result, g.targetAmount),
            streak: g.streak + 1,
            lastDepositDate: new Date().toLocaleDateString()
          };
        }
        return g;
      });
      saveGoals(updatedGoals);
      triggerToast(`Saved ₱${data.amount} towards Goal!`);
    }

    // Update budget spent field if expense
    if (data.type === 'expense') {
      const updatedCategories = budget.categories.map((c) => {
        if (c.name === data.category) {
          return { ...c, spent: c.spent + data.amount };
        }
        return c;
      });
      saveBudget({
        ...budget,
        expensesThisMonth: budget.expensesThisMonth + data.amount,
        categories: updatedCategories
      });
      triggerToast(`Logged Expense: ₱${data.amount}`);
    } else if (data.type === 'income') {
      triggerToast(`Logged Income Stream: ₱${data.amount}`);
    }
  };

  // Add new Goal
  const handleAddNewGoal = (data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    category: string;
    color: string;
    dueDate: string;
    imageUrl?: string;
  }) => {
    const newGoal: Goal = {
      id: 'g_added_' + Date.now(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      category: data.category,
      color: data.color,
      dueDate: data.dueDate,
      imageUrl: data.imageUrl,
      streak: 0
    };

    saveGoals([...goals, newGoal]);
    triggerToast(`Created goal: ${data.name}!`);
  };

  // Delete transaction from log with slide animation
  const handleDeleteTransaction = (id: string) => {
    const targetTx = transactions.find(t => t.id === id);
    if (!targetTx) return;

    // Capture current states before deletion
    setUndoState({
      goals: JSON.parse(JSON.stringify(goals)),
      transactions: JSON.parse(JSON.stringify(transactions)),
      budget: JSON.parse(JSON.stringify(budget)),
      message: `Deleted "${targetTx.title}"`,
      secondsLeft: 10
    });

    // If it was of 'expense' type, reverse the category budget allocation
    if (targetTx.type === 'expense') {
      const updatedCategories = budget.categories.map((c) => {
        if (targetTx.category === c.name) {
          return { ...c, spent: Math.max(0, c.spent - targetTx.amount) };
        }
        return c;
      });
      saveBudget({
        ...budget,
        categories: updatedCategories
      });
    }

    // If it was a 'savings' type, reverse the saved goal deposits
    if (targetTx.type === 'savings' && targetTx.goalId) {
      const updatedGoals = goals.map((g) => {
        if (g.id === targetTx.goalId) {
          return {
            ...g,
            currentAmount: Math.max(0, g.currentAmount - targetTx.amount),
            streak: Math.max(0, g.streak - 1),
          };
        }
        return g;
      });
      saveGoals(updatedGoals);
    }

    const filtered = transactions.filter(t => t.id !== id);
    saveTransactions(filtered);
    playPopSound();
    triggerToast('Transaction log scrubbed');
  };

  // New helper: Delete a target Dream Vault
  const handleDeleteGoal = (goalId: string) => {
    const target = goals.find(g => g.id === goalId);
    if (!target) return;

    // Capture current states before deletion
    setUndoState({
      goals: JSON.parse(JSON.stringify(goals)),
      transactions: JSON.parse(JSON.stringify(transactions)),
      budget: JSON.parse(JSON.stringify(budget)),
      message: `Deleted vault "${target.name}"`,
      secondsLeft: 10
    });

    const updated = goals.filter(g => g.id !== goalId);
    saveGoals(updated);

    // Reset active index if needed
    if (activeGoalIndex >= updated.length) {
      setActiveGoalIndex(Math.max(0, updated.length - 1));
    }
    playPopSound();
    triggerToast(`Vault "${target.name}" deleted! 🗑️`);
  };

  // New helper: Delete a custom budget limit category
  const handleDeleteBudgetCategory = (categoryName: string) => {
    // Capture current states before deletion
    setUndoState({
      goals: JSON.parse(JSON.stringify(goals)),
      transactions: JSON.parse(JSON.stringify(transactions)),
      budget: JSON.parse(JSON.stringify(budget)),
      message: `Deleted category "${categoryName}"`,
      secondsLeft: 10
    });

    const updatedCategories = budget.categories.filter(c => c.name !== categoryName);
    saveBudget({
      ...budget,
      categories: updatedCategories
    });
    playPopSound();
    triggerToast(`Budget category "${categoryName}" deleted! 🗑️`);
  };

  // Calculate totals
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalBudgetSpent = budget.categories.reduce((acc, c) => acc + c.spent, 0);
  const totalBudgetLeft = Math.max(0, budget.monthlyLimit - totalBudgetSpent);
  
  const activeGoal = goals[activeGoalIndex];
  const activeGoalPct = activeGoal ? Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100) : 0;

  // Helper to get month abbreviation
  const getMonthAbbr = (monthStr: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(monthStr, 10) - 1;
    return idx >= 0 && idx < 12 ? months[idx] : monthStr;
  };

  // Generate dynamic dataset for Line Area chart based on actual transaction ledger!
  const getChartData = () => {
    const sorted = [...transactions].reverse(); // chronological order (oldest first)
    const historicPoints: { savings: number; expenses: number; label: string }[] = [];

    // Starting baseline
    historicPoints.push({ savings: 0, expenses: 0, label: 'Start' });

    let runningSavings = 0;
    let runningExpenses = 0;

    sorted.forEach((tx) => {
      if (tx.type === 'savings') {
        runningSavings += tx.amount;
      } else if (tx.type === 'expense') {
        runningExpenses += tx.amount;
      }
      
      const parts = tx.date.split('-');
      const label = parts.length >= 3 ? `${getMonthAbbr(parts[1])} ${parts[2]}` : tx.date;
      
      historicPoints.push({
        savings: runningSavings,
        expenses: runningExpenses,
        label
      });
    });

    const finalSavings: number[] = [];
    const finalExpenses: number[] = [];
    const finalLabels: string[] = [];

    if (historicPoints.length <= 5) {
      const padCount = 5 - historicPoints.length;
      for (let i = 0; i < padCount; i++) {
        finalSavings.push(0);
        finalExpenses.push(0);
        finalLabels.push(`Wk ${i + 1}`);
      }
      historicPoints.forEach((p) => {
        finalSavings.push(p.savings);
        finalExpenses.push(p.expenses);
        finalLabels.push(p.label);
      });
    } else {
      for (let i = 0; i < 5; i++) {
        const idx = Math.floor((i / 4) * (historicPoints.length - 1));
        const p = historicPoints[idx];
        finalSavings.push(Math.round(p.savings));
        finalExpenses.push(Math.round(p.expenses));
        finalLabels.push(p.label);
      }
    }

    return {
      savingsData: finalSavings,
      expenseData: finalExpenses,
      labels: finalLabels,
      totalSavings: runningSavings,
      savingsRate: (runningSavings + runningExpenses > 0) ? Math.round((runningSavings / (runningSavings + runningExpenses)) * 100) : 0
    };
  };

  const chartData = getChartData();

  // Generate daily expenditures breakdown for the Bar Chart based on actual ledger!
  const getWeeklyExpenditureData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayTotals: Record<string, number> = {
      'Mon': 0,
      'Tue': 0,
      'Wed': 0,
      'Thu': 0,
      'Fri': 0,
      'Sat': 0,
      'Sun': 0,
    };

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        let txDate = new Date();
        if (tx.id && tx.id.startsWith('tx_added_')) {
          const ts = parseInt(tx.id.replace('tx_added_', ''), 10);
          if (!isNaN(ts)) {
            txDate = new Date(ts);
          }
        }
        const dayName = days[txDate.getDay()];
        if (dayTotals[dayName] !== undefined) {
          dayTotals[dayName] += tx.amount;
        }
      }
    });

    return [
      { label: 'Mon', value: dayTotals['Mon'] },
      { label: 'Tue', value: dayTotals['Tue'] },
      { label: 'Wed', value: dayTotals['Wed'] },
      { label: 'Thu', value: dayTotals['Thu'] },
      { label: 'Fri', value: dayTotals['Fri'] },
      { label: 'Sat', value: dayTotals['Sat'] },
      { label: 'Sun', value: dayTotals['Sun'] },
    ];
  };

  const weeklyExpenses = getWeeklyExpenditureData();

  // Aesthetic color maps
  const colorGradients: Record<string, string> = {
    amber: 'linear-gradient(135deg, #0F172A 0%, #1c352d 50%, #2f4f41 100%)',
    blue: 'linear-gradient(135deg, #0A1128 0%, #001F54 50%, #1282A2 100%)',
    emerald: 'linear-gradient(135deg, #021C1E 0%, #004445 50%, #2C7873 100%)',
    purple: 'linear-gradient(135deg, #1A0B2E 0%, #321A5C 50%, #5E32A6 100%)',
    rose: 'linear-gradient(135deg, #2D0510 0%, #5C1227 50%, #9F163D 100%)',
  };

  // Dynamic design vibes configurations mapping
  const themeStyles = {
    cosmic: {
      bg: 'bg-gradient-to-b from-[#0B0F19] to-[#141A29] text-stone-100',
      textMain: 'text-stone-100',
      textMuted: 'text-stone-400',
      textTitle: 'text-white',
      border: 'border-stone-800/85',
      cardBg: 'bg-stone-900 border-stone-800/80 text-stone-100',
      buttonPrimary: 'bg-indigo-600 hover:bg-indigo-550 text-white',
      navBg: 'bg-stone-900/95 border-stone-800 text-stone-300',
      tabActiveIndicator: 'bg-stone-800 border-stone-700/60',
      tabActiveText: 'text-white font-black',
      tabInactiveText: 'text-stone-500 hover:text-stone-300',
      weeklyColor: 'bg-indigo-500',
      vaultText: 'text-indigo-400',
      vaultBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      headerInitials: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    sage: {
      bg: 'bg-gradient-to-b from-[#F2F5F3] to-[#E3EAE6] text-[#1F3329]',
      textMain: 'text-[#1F3329]',
      textMuted: 'text-[#5A6E64]',
      textTitle: 'text-[#1F3329]',
      border: 'border-[#DFE5E1]',
      cardBg: 'bg-white border-[#E3ECE7] text-stone-805',
      buttonPrimary: 'bg-[#1F3329] hover:bg-[#2C483A] text-white',
      navBg: 'bg-white border-[#DFE5E1] text-[#5A6E64]',
      tabActiveIndicator: 'bg-emerald-50 border-[#E3ECE7]',
      tabActiveText: 'text-emerald-950 font-black',
      tabInactiveText: 'text-emerald-700/60 hover:text-emerald-805',
      weeklyColor: 'bg-emerald-650',
      vaultText: 'text-emerald-700',
      vaultBg: 'bg-emerald-50 border-emerald-150 text-emerald-805',
      headerInitials: 'bg-[#1F3329] text-emerald-50'
    },
    sakura: {
      bg: 'bg-[#FFF9F9] text-[#3B1919]',
      textMain: 'text-[#3B1919]',
      textMuted: 'text-[#8C5A5A]',
      textTitle: 'text-[#3B1919]',
      border: 'border-[#F8E3E3]',
      cardBg: 'bg-white border-[#FAE6E6] text-stone-850',
      buttonPrimary: 'bg-rose-650 hover:bg-rose-600 text-white',
      navBg: 'bg-white border-[#F8E3E3] text-[#8C5A5A]',
      tabActiveIndicator: 'bg-rose-50 border-rose-100',
      tabActiveText: 'text-rose-950 font-black',
      tabInactiveText: 'text-rose-700/60 hover:text-[#3B1919]',
      weeklyColor: 'bg-rose-500',
      vaultText: 'text-rose-700',
      vaultBg: 'bg-[#FEEAEA] border-[#FAD0D0] text-rose-800',
      headerInitials: 'bg-rose-500 text-white font-semibold'
    },
    golden: {
      bg: 'bg-[#FBF9F5]/45 text-stone-800',
      textMain: 'text-stone-800',
      textMuted: 'text-stone-400',
      textTitle: 'text-stone-850',
      border: 'border-stone-100/60',
      cardBg: 'bg-white border-stone-100 text-stone-800',
      buttonPrimary: 'bg-stone-900 hover:bg-stone-800 text-white',
      navBg: 'bg-white border-stone-150 text-stone-400',
      tabActiveIndicator: 'bg-[#FAF9F5] border-stone-150/40',
      tabActiveText: 'text-stone-900 font-black',
      tabInactiveText: 'text-stone-400 hover:text-stone-600',
      weeklyColor: 'bg-amber-500',
      vaultText: 'text-amber-850',
      vaultBg: 'bg-amber-50 border-amber-150 text-amber-800',
      headerInitials: 'bg-stone-900 text-[#FBF9F5]'
    },
  }[themeVibe] || {
    bg: 'bg-[#FBF9F5]/45 text-stone-805',
    textMain: 'text-stone-800',
    textMuted: 'text-stone-400',
    textTitle: 'text-stone-850',
    border: 'border-stone-100/60',
    cardBg: 'bg-white border-stone-100 text-stone-800',
    buttonPrimary: 'bg-stone-900 hover:bg-stone-800 text-white',
    navBg: 'bg-white border-stone-150 text-stone-400',
    tabActiveIndicator: 'bg-[#FAF9F5] border-stone-150/40',
    tabActiveText: 'text-stone-900 font-black',
    tabInactiveText: 'text-stone-400 hover:text-stone-600',
    weeklyColor: 'bg-amber-500',
    vaultText: 'text-amber-850',
    vaultBg: 'bg-amber-50 border-amber-150 text-amber-800',
    headerInitials: 'bg-stone-900 text-[#FBF9F5]'
  };

  // Dynamic background wrapper
  const getVibeWrapperClass = () => {
    switch (themeVibe) {
      case 'cosmic':
        return 'w-full max-w-md min-h-screen bg-[#0B0F19] text-stone-100 pb-28 relative flex flex-col justify-start touch-pan-y antialiased border-x border-stone-900 shadow-2xl mx-auto transition-all duration-300';
      case 'sage':
        return 'w-full max-w-md min-h-screen bg-[#F2F5F3] text-[#1F3329] pb-28 relative flex flex-col justify-start touch-pan-y antialiased border-x border-[#DFE5E1] shadow-lg mx-auto transition-all duration-300';
      case 'sakura':
        return 'w-full max-w-md min-h-screen bg-[#FFF9F9] text-[#3B1919] pb-28 relative flex flex-col justify-start touch-pan-y antialiased border-x border-[#F8E3E3] shadow-lg mx-auto transition-all duration-300';
      case 'golden':
      default:
        return 'w-full max-w-md min-h-screen bg-[#FBF9F5]/45 select-none text-stone-800 pb-28 relative flex flex-col justify-start touch-pan-y antialiased border-x border-stone-100/60 shadow-lg mx-auto transition-all duration-300';
    }
  };

  return (
    <div className={getVibeWrapperClass()}>
      
      {/* Toast Flasher */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-800/80 text-white rounded-full px-5 py-2.5 text-xs font-bold leading-none tracking-tight flex items-center gap-1.5 shadow-xl z-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Banner Notification */}
      <AnimatePresence>
        {undoState && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[360px] bg-stone-900 text-stone-50 rounded-2xl p-3.5 flex items-center justify-between gap-3.5 shadow-xl border border-stone-850 z-50"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 relative">
                <RotateCcw className="w-4 h-4 animate-spin-reverse" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[9px] text-stone-950 font-extrabold px-1.5 py-0.5 rounded-full leading-none scale-90">{undoState.secondsLeft}s</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">Accidental tap?</span>
                <span className="text-xs font-extrabold text-white tracking-tight block truncate leading-tight">
                  {undoState.message}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUndo}
              className="bg-white hover:bg-stone-100 text-stone-950 px-3.5 py-2 rounded-xl text-xs font-bold leading-none select-none cursor-pointer transition-all active:scale-95 flex-shrink-0"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top status bar & premium layout */}
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <div className="flex gap-2.5 items-center">
          <div className={`w-9 h-9 rounded-xl ${themeStyles.headerInitials} flex items-center justify-center font-bold text-xs shadow-md tracking-widest uppercase`}>
            {userInitials}
          </div>
          <div>
            <span className={`text-[10px] ${themeStyles.textMuted} block leading-none`}>Good morning,</span>
            <h1 className={`text-sm font-bold flex items-center gap-1 leading-none ${themeStyles.textTitle}`}>
              {userName} 👋
            </h1>
          </div>
        </div>

        {/* Premium badge info & Help Guide trigger consolidated in a 3-dot menu */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => { setIsMenuOpen(prev => !prev); playPopSound(); }}
            title="Menu options"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-white/20 border ${themeVibe === 'cosmic' ? 'border-stone-800' : 'border-stone-200'} cursor-pointer active:scale-95 shadow-sm text-stone-600`}
          >
            <MoreVertical className={`w-4 h-4 ${themeVibe === 'cosmic' ? 'text-indigo-300' : 'text-stone-700'}`} />
          </button>

          {/* Menu Dropdown items panel */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div 
                  className="fixed inset-0 z-45 cursor-default" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute right-0 mt-1.5 w-36 rounded-2xl p-1.5 shadow-xl border z-50 flex flex-col gap-1 ${
                    themeStyles.cardBg
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsOnboardingOpen(true);
                      setIsMenuOpen(false);
                      playPopSound();
                    }}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      themeVibe === 'cosmic' 
                        ? 'hover:bg-indigo-500/20 text-stone-100' 
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    Style Vibe
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGuideOpen(prev => !prev);
                      setIsMenuOpen(false);
                      playPopSound();
                    }}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      themeVibe === 'cosmic' 
                        ? 'hover:bg-indigo-500/20 text-stone-100' 
                        : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    How to Save
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic Swiping Viewport wrapper */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleViewportDragEnd}
        className="px-5 w-full overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Premium Interactive Onboarding Tutorial / Logic Walkthrough Card */}
              <AnimatePresence>
                {isGuideOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-[#FBF9F5] border border-stone-800 rounded-[24px] p-5.5 relative shadow-xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <h4 className="font-extrabold text-[11px] sm:text-xs tracking-tight text-[#FBF9F5] uppercase">
                          How {userName}'s Dream Vault Works! 📖✨
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsGuideOpen(false); playPopSound(); }}
                        className="p-1 px-2.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all text-[9.5px] font-mono cursor-pointer active:scale-95"
                        title="Dismiss walkthrough"
                      >
                        Hide ✕
                      </button>
                    </div>

                    <p className="text-[11px] text-[#D6D3C7] mt-2.5 leading-relaxed font-normal">
                      This app helps you build micro-savings vaults while managing a healthy allowance limit. Tap the "Guide" key in the header anytime to view these steps:
                    </p>

                    <div className="grid grid-cols-1 gap-3.5 mt-4">
                      <div className="flex gap-3.5 items-start">
                        <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 font-extrabold text-[10.5px] font-mono flex-shrink-0">
                          1
                        </div>
                        <div>
                          <strong className="text-xs text-[#FBF9F5] block font-semibold leading-tight">Fast Coin Drops</strong>
                          <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">
                            Click <strong className="text-stone-100">"Add Ipon"</strong> or <strong>drag physical coins upwards</strong> into the Drop Zone to save instantly!
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3.5 items-start">
                        <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 font-extrabold text-[10.5px] font-mono flex-shrink-0">
                          2
                        </div>
                        <div>
                          <strong className="text-xs text-[#FBF9F5] block font-semibold leading-tight">Touch-to-Customize</strong>
                          <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">
                            Tap the cover thumbnail to choose <strong>any photo from your gallery</strong>. Tap the <strong>🔒 Target</strong> value to live-customize price checkpoints!
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3.5 items-start">
                        <div className="w-6 h-6 rounded-lg bg-indigo-400/20 flex items-center justify-center text-indigo-300 font-extrabold text-[10.5px] font-mono flex-shrink-0">
                          3
                        </div>
                        <div>
                          <strong className="text-xs text-[#FBF9F5] block font-semibold leading-tight">Mistake Correction</strong>
                          <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5">
                            Allocations are logged in the <strong>Budgets tab</strong>. Click the custom red 🗑️ bin/trash icons next to budget lines or targets to remove accidental entries.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] text-[#A8A29E]">
                      <span className="italic flex items-center gap-1">✨ Automatic LocalStorage save active</span>
                      <button 
                        type="button"
                        onClick={handleResetAllData}
                        className="text-[9.5px] text-stone-400 hover:text-rose-400 underline font-mono flex items-center gap-1 cursor-pointer"
                        title="Reset all system values back to clean baseline"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> reset system
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Premium Dream Phone Hero Display Card with Gradient Overlay */}
              {activeGoal && (
                <div 
                  className="rounded-[28px] p-5 text-white flex gap-4.5 relative overflow-hidden transition-all duration-300 shadow-[0_12px_28px_-10px_rgba(0,0,0,0.18)]"
                  style={{ background: colorGradients[activeGoal.color] || colorGradients.amber }}
                >
                  {/* Glowing decorative ambient meshes */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-[#10b981]/20 blur-xl pointer-events-none" />

                  {/* Vault Image Preset / User Upload */}
                  <div 
                    onClick={() => document.getElementById('image-gallery-file-picker-' + activeGoal.id)?.click()}
                    className="w-20 sm:w-22 flex-shrink-0 relative cursor-pointer group rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-300"
                    title="Click to change vault image from gallery"
                  >
                    <img
                      src={activeGoal.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80'}
                      alt={activeGoal.name}
                      onError={(e) => {
                        // Fallback image link if custom dies
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-36 object-cover rounded-2xl border border-white/10 bg-black/20"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] gap-1.5">
                      <Camera className="w-5 h-5 text-white" />
                      <span className="text-[7.5px] font-extrabold uppercase tracking-widest text-[#FBF9F5]">Change</span>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-white/10 backdrop-blur-md text-white border border-white/15 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold">
                      {activeGoal.category}
                    </span>
                  </div>

                  <input
                    type="file"
                    id={'image-gallery-file-picker-' + activeGoal.id}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          const updatedGoals = goals.map((g) => {
                            if (g.id === activeGoal.id) {
                              return { ...g, imageUrl: base64String };
                            }
                            return g;
                          });
                          saveGoals(updatedGoals);
                          playSuccessSound();
                          triggerToast("Vault picture updated! 📸✨");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* Details panel */}
                  <div className="flex-1 min-width-0 flex flex-col justify-between pt-1">
                    <div className="flex justify-between items-start gap-1.5">
                      <div>
                        <h2 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight line-clamp-2">
                          {activeGoal.name}
                        </h2>
                        <span className="text-[10px] text-stone-300 font-medium">Vault Category Target</span>
                      </div>
                      
                      {/* Active streak */}
                      {activeGoal.streak > 0 && (
                        <div className="flex flex-col items-center flex-shrink-0 bg-white/10 px-2 py-1 rounded-xl">
                          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse fill-orange-400" />
                          <span className="text-[8px] font-bold mt-0.5 font-mono">{activeGoal.streak}d</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-stone-300 font-bold">Progress</span>
                        <span className="text-sm font-black font-mono text-amber-300">{activeGoalPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500" 
                          style={{ width: `${activeGoalPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-stone-200 mt-2 border-t border-white/5 pt-2">
                      {isEditingTarget ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const parsed = parseFloat(tempTargetAmount);
                            if (!isNaN(parsed) && parsed > 0) {
                              const updatedGoals = goals.map((g) => {
                                if (g.id === activeGoal.id) {
                                  return { ...g, targetAmount: parsed };
                                }
                                return g;
                              });
                              saveGoals(updatedGoals);
                              setIsEditingTarget(false);
                              playSuccessSound();
                              triggerToast(`Target updated: ₱${parsed.toLocaleString()}! 💰`);
                            } else {
                              setIsEditingTarget(false);
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <span className="font-bold text-stone-300">₱</span>
                          <input
                            type="number"
                            autoFocus
                            required
                            step="any"
                            value={tempTargetAmount}
                            onChange={(e) => setTempTargetAmount(e.target.value)}
                            onBlur={() => {
                              setTimeout(() => setIsEditingTarget(false), 200);
                            }}
                            className="w-20 bg-stone-900 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-amber-300 text-left"
                            placeholder="Amount"
                          />
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setTempTargetAmount(activeGoal.targetAmount.toString());
                            setIsEditingTarget(true);
                            playPopSound();
                          }}
                          className="flex items-center gap-1 hover:text-white hover:bg-white/10 rounded px-1 -ml-1 py-0.5 transition-all cursor-pointer font-medium"
                          title="Click to customize target price"
                        >
                          🔒 Target: ₱{activeGoal.targetAmount.toLocaleString()}
                        </button>
                      )}
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        ₱{activeGoal.currentAmount.toLocaleString()} Saved
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Elegant Empty State for active goal on Home */}
              {!activeGoal && (
                <div 
                  onClick={() => setIsGoalModalOpen(true)}
                  className="rounded-[28px] p-6 border-2 border-dashed border-stone-200/80 hover:border-amber-400 bg-white/70 hover:bg-white text-stone-700 flex flex-col items-center justify-center text-center py-9 transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-505 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-sm">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                  <h4 className="font-extrabold text-xs text-stone-850 tracking-tight uppercase">No Dream Saving Vaults! 🎯</h4>
                  <p className="text-[10.5px] text-stone-400 max-w-[245px] mt-1 font-medium leading-relaxed">
                    Tap here or use <strong className="text-stone-700">"Set Goal"</strong> below to create your very first micro-savings target vault.
                  </p>
                </div>
              )}

              {/* Multiple Goals cycle slider if there are more than 1 goals */}
              {goals.length > 1 && (
                <div className="flex gap-2 justify-center items-center">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Switch Active Vault:</span>
                  <div className="flex gap-1.5">
                    {goals.map((g, idx) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => { setActiveGoalIndex(idx); playPopSound(); }}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          activeGoalIndex === idx 
                            ? 'bg-amber-500 scale-110 w-5' 
                            : 'bg-stone-300 hover:bg-stone-400'
                        }`}
                        title={g.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fast-Save Gesture Coins piggy bank */}
              <DropPiggyBank 
                onDeposit={depositFund} 
                activeGoalName={activeGoal?.name || ""} 
                disabled={goals.length === 0}
              />

              {/* Recent Activity lists history container that acts like a history list */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5 px-1">Recent Activity</h3>
                {transactions.length === 0 ? (
                  <div className="bg-white/90 rounded-3xl border border-dashed border-stone-200 p-6 text-center py-8 relative overflow-hidden shadow-sm">
                    <span className="text-2xl block mb-1.5">📝</span>
                    <h4 className="font-extrabold text-xs text-stone-850 uppercase tracking-widest">No activities yet</h4>
                    <p className="text-[10.5px] text-stone-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Your ledger is clear. Save micro-savings or log expenses to see your timeline build.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 4).map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-white rounded-2xl p-3.5 border border-stone-100 flex items-center justify-between gap-3 text-xs shadow-sm"
                      >
                        {/* Status Indicator */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'savings' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : tx.type === 'expense' 
                            ? 'bg-rose-50/50 text-rose-500' 
                            : 'bg-stone-50 text-stone-605'
                        }`}>
                          {tx.type === 'savings' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-extrabold text-xs text-stone-800 tracking-tight line-clamp-1 leading-tight">
                            {tx.title}
                          </h5>
                          <div className="flex gap-1.5 mt-0.5 items-center text-[9.5px] text-stone-400 font-semibold uppercase">
                            <span>{tx.date}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-stone-300" />
                            <span className="italic line-clamp-1">{tx.category}</span>
                          </div>
                        </div>

                        {/* Amount & Trash Bin */}
                        <div className="text-right flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono tracking-tight ${
                            tx.type === 'savings' || tx.type === 'income'
                              ? 'text-emerald-700'
                              : 'text-stone-800'
                          }`}>
                            {tx.type === 'savings' || tx.type === 'income' ? '+' : '−'}₱{tx.amount.toLocaleString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 rounded-lg border border-stone-100 text-stone-300 hover:text-rose-600 hover:border-rose-100 transition-all cursor-pointer bg-stone-50/10"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {transactions.length > 4 && (
                      <button
                        type="button"
                        onClick={() => handleTabSwitch('analytics')}
                        className="w-full text-center py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-100 border-dashed rounded-xl text-[10.5px] font-bold text-stone-500 transition-colors cursor-pointer"
                      >
                        View all {transactions.length} ledger logs in reports
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Elegant micro-tip */}
              <div className="bg-[#FAF9F5] border border-stone-200/50 rounded-2xl p-4 flex gap-3.5 items-start">
                <Smile className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-stone-700">Daily Tip of the Month</h5>
                  <p className="text-[10.5px] text-stone-400 mt-1 leading-relaxed">
                    Skip one ₱150 premium latte today — that is roughly 0.2% closer to your dream vault. Continuous discipline compounds into massive returns. Stay focused!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Goals view page */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-850 tracking-tight">Active Vault targets</h3>
                  <p className="text-xs text-stone-400">Manage your dream target checkpoints</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(true)}
                  className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold transition-all hover:bg-stone-800 shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New
                </button>
              </div>

              {/* Seeded and user custom goals listing */}
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="bg-white/90 rounded-3xl p-7 border border-dashed border-stone-200 text-center py-10 shadow-sm relative overflow-hidden">
                    <span className="text-2xl block">🔒</span>
                    <h4 className="font-extrabold text-xs text-stone-800 mt-2 uppercase tracking-wide">No Active Savings Vaults</h4>
                    <p className="text-[10.5px] text-stone-400 mt-1.5 max-w-[230px] mx-auto leading-relaxed">
                      You do not have any active saving targets. Tap <strong className="text-stone-700">"Add New"</strong> in the top corner to initialize a personalized micro-saving vault!
                    </p>
                  </div>
                ) : (
                  goals.map((g, idx) => {
                    const pct = Math.round((g.currentAmount / g.targetAmount) * 105) || 0;
                    const clampedPct = Math.min(pct, 100);
                    const isDone = g.currentAmount >= g.targetAmount;
                    
                    return (
                      <div 
                        key={g.id}
                        className="bg-white rounded-2xl p-4.5 border border-stone-100 shadow-sm relative overflow-hidden"
                      >
                        <div className="flex gap-4 items-center">
                          {/* Goal mini visual representation with CSS Phone inside */}
                          <div 
                            onClick={() => document.getElementById(`list-image-picker-${g.id}`)?.click()}
                            className="w-16 h-20 bg-stone-50 border border-stone-150/70 rounded-xl overflow-hidden relative flex flex-col items-center justify-center cursor-pointer group"
                            title="Click to customize image for this vault"
                          >
                            {g.imageUrl ? (
                              <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover animate-fade-in" />
                            ) : (
                              <div className="w-8 h-12 rounded-md bg-stone-900 border border-stone-700 relative flex items-center justify-center">
                                <span className="text-[7px] text-white font-bold tracking-tighter">PH</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="absolute top-1 left-1 px-1 bg-stone-900 text-[6.5px] font-bold text-stone-100 rounded leading-none uppercase">
                              {g.category}
                            </span>
                          </div>

                          <input
                            type="file"
                            id={`list-image-picker-${g.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  const updatedGoals = goals.map((item) => {
                                    if (item.id === g.id) {
                                      return { ...item, imageUrl: base64String };
                                    }
                                    return item;
                                  });
                                  saveGoals(updatedGoals);
                                  playSuccessSound();
                                  triggerToast(`Image updated for ${g.name}! 📸✨`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                          {/* Text and amounts content */}
                          <div className="flex-1 min-width-0">
                            <div className="flex justify-between items-start gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-stone-850 leading-tight block truncate uppercase">
                                {g.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isDone ? (
                                  <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Checked
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 leading-none">
                                    {clampedPct}%
                                  </span>
                                )}
                                
                                {/* Deletion Bin button for target vault */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGoal(g.id);
                                  }}
                                  className="p-1 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer active:scale-95"
                                  title={`Delete ${g.name} vault`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-baseline mt-2 font-mono">
                              <span className="text-xs font-black text-stone-800">
                                ₱{g.currentAmount.toLocaleString()}
                              </span>
                              {editingGoalTargetId === g.id ? (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const parsed = parseFloat(tempGoalTargetValue);
                                    if (!isNaN(parsed) && parsed > 0) {
                                      const updatedGoals = goals.map((item) => {
                                        if (item.id === g.id) {
                                          return { ...item, targetAmount: parsed };
                                        }
                                        return item;
                                      });
                                      saveGoals(updatedGoals);
                                      setEditingGoalTargetId(null);
                                      playSuccessSound();
                                      triggerToast(`Target updated for ${g.name}! 💰`);
                                    } else {
                                      setEditingGoalTargetId(null);
                                    }
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-[10px] text-stone-400">of ₱</span>
                                  <input
                                    type="number"
                                    autoFocus
                                    required
                                    step="any"
                                    value={tempGoalTargetValue}
                                    onChange={(e) => setTempGoalTargetValue(e.target.value)}
                                    onBlur={() => {
                                      setTimeout(() => setEditingGoalTargetId(null), 200);
                                    }}
                                    className="w-16 bg-stone-100 border border-stone-300 rounded px-1 text-stone-900 text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-right"
                                    placeholder="Amount"
                                  />
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempGoalTargetValue(g.targetAmount.toString());
                                    setEditingGoalTargetId(g.id);
                                    playPopSound();
                                  }}
                                  className="text-[10px] text-stone-400 hover:text-stone-700 hover:underline cursor-pointer border border-transparent rounded px-1 whitespace-nowrap"
                                  title="Click to edit target price"
                                >
                                  of ₱{g.targetAmount.toLocaleString()}
                                </button>
                              )}
                            </div>

                            {/* Progress Line Bar */}
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500" 
                                style={{ width: `${clampedPct}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[9px] text-stone-400 mt-2">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <Calendar className="w-3 h-3 text-stone-400" />
                                Target: {g.dueDate}
                              </span>
                              {g.streak > 0 && (
                                <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                                  🔥 {g.streak}d streak
                                </span>
                              )}
                            </div>

                            {/* Time-to-Goal Micro Estimate */}
                            {(() => {
                              const remainingGoalAmount = Math.max(0, g.targetAmount - g.currentAmount);
                              let estimateText = "";
                              
                              if (remainingGoalAmount <= 0) {
                                estimateText = "Goal Reached! 🎉";
                              } else {
                                const goalTx = transactions.filter(t => t.type === 'savings' && t.goalId === g.id);
                                let rate = 100; // default habit rate
                                
                                if (goalTx.length > 0) {
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
                                    rate = Math.max(10, Math.round((totalSavedGoal / goalTx.length) / 7));
                                  } else {
                                    rate = Math.max(1, Math.round(totalSavedGoal / diffDays));
                                  }
                                } else {
                                  const anySavingsTx = transactions.filter(t => t.type === 'savings');
                                  if (anySavingsTx.length > 0) {
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
                                      rate = Math.max(20, Math.round(totalOverallSaved / anySavingsTx.length));
                                    } else {
                                      rate = Math.max(10, Math.round(totalOverallSaved / diffD));
                                    }
                                  }
                                }

                                const estDays = Math.ceil(remainingGoalAmount / rate);
                                if (estDays >= 9999) {
                                  estimateText = "Never (savings rate is 0)";
                                } else {
                                  const targetD = new Date();
                                  targetD.setDate(targetD.getDate() + estDays);
                                  const dateFormatted = targetD.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                  estimateText = `Est. Achieve: ${estDays} days (~${dateFormatted})`;
                                }
                              }

                              return (
                                <div className="mt-2 pt-1.5 border-t border-stone-100/60 flex justify-between items-center text-[8.5px] text-stone-400 font-semibold italic">
                                  <span>✨ Velocity: ₱{remainingGoalAmount <= 0 ? 0 : Math.round(remainingGoalAmount / (parseInt(estimateText.match(/\d+/)?.[0] || "1", 10) || 1))}/day</span>
                                  <span className="text-emerald-600 font-bold">{estimateText}</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Achievements list container */}
              <AchievementsGrid goals={goals} totalSaved={totalSaved} />
            </motion.div>
          )}

          {/* Budget configuration page */}
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-extrabold text-lg text-stone-850 tracking-tight">Monthly Allowance</h3>
                <p className="text-xs text-stone-400">Review allocations and active spending balances</p>
              </div>

              {/* Main overall budget card */}
              <div className="bg-white border border-stone-100 rounded-[28px] p-5 shadow-sm relative overflow-hidden">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Month overall status</span>
                <div className="flex justify-between items-baseline mt-1">
                  <strong className="text-2xl font-black tracking-tight font-mono text-stone-850">
                    ₱{totalBudgetLeft.toLocaleString()} <span className="text-xs text-stone-400 tracking-normal font-sans font-medium">left</span>
                  </strong>
                  <span className="text-xs font-semibold text-stone-500">
                    ₱{totalBudgetSpent.toLocaleString()} of ₱{budget.monthlyLimit.toLocaleString()} Spent
                  </span>
                </div>

                <div className="w-full h-2 bg-stone-100 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-stone-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totalBudgetSpent / budget.monthlyLimit) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-400 mt-2.5 font-semibold">
                  <span>{Math.round((totalBudgetSpent / budget.monthlyLimit) * 100)}% Used</span>
                  <span>18 calendar days remaining</span>
                </div>
              </div>

              {/* Bar charts display for expenditure */}
              <CustomChart type="bar" weeklyData={weeklyExpenses} />

              {/* Categories breakdowns progress logs */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 mb-3 px-1">Allocated Categories</h4>
                <div className="space-y-2.5">
                  {budget.categories.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6.5 border border-dashed border-stone-200 text-center py-9 shadow-sm relative overflow-hidden">
                      <span className="text-2xl block mb-1">📋</span>
                      <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wide">No Budget Categories</h4>
                      <p className="text-[10.5px] text-stone-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        There are no active spending categories. Use the <strong className="text-stone-700">Add Limit</strong> button below to set down a budget limit!
                      </p>
                    </div>
                  ) : (
                    budget.categories.map((c) => {
                      const usagePct = Math.round((c.spent / c.allocated) * 110) || 0;
                      const clampedUsagePct = Math.min(usagePct, 100);
                      
                      return (
                        <div 
                          key={c.name}
                          className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-3.5"
                        >
                        <div className={`w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-700 font-sans`}>
                          <span className="text-lg">{getCategoryEmoji(c.name)}</span>
                        </div>
                        
                        <div className="flex-1 min-width-0">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xs font-bold text-stone-800 tracking-tight flex items-center gap-1.5 leading-none">
                              <span>{c.name}</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteBudgetCategory(c.name)}
                                className="p-0.5 text-stone-300 hover:text-rose-600 rounded hover:bg-stone-50 transition-colors cursor-pointer active:scale-95"
                                title={`Delete ${c.name} limit category`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-500" />
                              </button>
                            </h5>
                            <span className="text-xs font-mono font-bold text-stone-700">
                              ₱{c.spent.toLocaleString()} / ₱{c.allocated.toLocaleString()}
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-stone-50 rounded-full my-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                c.spent > c.allocated * 0.8 ? 'bg-rose-500' : 'bg-stone-900'
                              }`}
                              style={{ width: `${clampedUsagePct}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[9px] text-stone-400">
                            <span>{clampedUsagePct}% used limit</span>
                            <span className="font-extrabold text-[#059669]">
                              ₱{Math.max(0, c.allocated - c.spent).toLocaleString()} remaining
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                  {/* Dynamic Add custom budget limit form inline */}
                  {isAddingCategory ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCategoryName.trim()) return;
                        const parsedAlloc = parseFloat(newCategoryAlloc);
                        if (isNaN(parsedAlloc) || parsedAlloc <= 0) {
                          triggerToast("Specify a valid allocated limit! 💰");
                          return;
                        }
                        
                        // Check duplicate
                        if (budget.categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
                          triggerToast("A budget category with this name exists! ⚠️");
                          return;
                        }
                        
                        const newCat = {
                          name: newCategoryName.trim(),
                          allocated: parsedAlloc,
                          spent: 0,
                          color: 'amber',
                          icon: 'PlusCircle'
                        };
                        
                        const updated = [...budget.categories, newCat];
                        saveBudget({
                          ...budget,
                          categories: updated
                        });
                        
                        setNewCategoryName('');
                        setNewCategoryAlloc('');
                        setIsAddingCategory(false);
                        playSuccessSound();
                        triggerToast(`Category "${newCat.name}" added! 📊`);
                      }}
                      className="bg-stone-50 border border-dashed border-stone-205 rounded-2xl p-4.5 space-y-3 mt-3 animate-fade-in"
                    >
                      <h5 className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">Create Custom Budget Limit</h5>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[9px] text-stone-400 font-bold block mb-1 uppercase">Category Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Shopping"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-stone-400 font-bold block mb-1 uppercase">Allocated (₱)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            step="any"
                            placeholder="e.g. 1500"
                            value={newCategoryAlloc}
                            onChange={(e) => setNewCategoryAlloc(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-stone-850 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end text-[11px] pt-1.5">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-3 py-1.5 rounded-lg text-stone-500 hover:bg-stone-100 font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          Save Limit
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setIsAddingCategory(true); playPopSound(); }}
                      className="w-full py-3 border border-dashed border-stone-200 hover:border-stone-400 rounded-2xl flex items-center justify-center gap-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-all text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-stone-400" />
                      Add Custom Budget Category
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Line chart tab screen */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-extrabold text-lg text-stone-850 tracking-tight">Deposit analysis</h3>
                <p className="text-xs text-stone-400">Deep visual projection of micro-contributions</p>
              </div>

              {/* Curved SVG Area flows display chart */}
              <CustomChart 
                type="line" 
                savingsData={chartData.savingsData}
                expenseData={chartData.expenseData}
                labels={chartData.labels}
                totalSavings={chartData.totalSavings}
                savingsRate={chartData.savingsRate}
              />

              {/* Dynamic Pie allocation of savings funds */}
              <VaultPieChart goals={goals} />

              {/* Habit alarm/saving motivation triggers */}
              <SavingsReminderCard 
                onTriggerToast={triggerToast}
                userName={userName}
                themeVibe={themeVibe}
              />

              {/* Recent Activity lists history container with Swipe Deletion gesture */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400 px-1">Ledger History</h4>
                  <span className="text-[10px] text-stone-400 font-semibold italic">Swipe or tap bin to scrub logs</span>
                </div>

                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <div className="bg-white/90 border border-dashed border-stone-200 rounded-2xl p-7 text-center py-10 relative overflow-hidden">
                      <span className="text-2xl block mb-1.5">📝</span>
                      <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wide">Empty Ledger Log</h4>
                      <p className="text-[10.5px] text-stone-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        The transaction history is completely clear! Save coins or log expense entries using the trigger buttons.
                      </p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -140 }}
                        className="bg-white rounded-2xl p-3.5 border border-stone-100 shadow-sm flex items-center justify-between gap-3 relative group"
                      >
                        {/* Status Type Indicator */}
                        <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'savings' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : tx.type === 'expense' 
                            ? 'bg-rose-50/50 text-rose-500' 
                            : 'bg-stone-50 text-stone-700'
                        }`}>
                          {tx.type === 'savings' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                        </div>

                        {/* Title and relative timestamp detail */}
                        <div className="flex-1 min-width-0">
                          <h5 className="font-extrabold text-xs text-stone-800 tracking-tight line-clamp-1 leading-tight">
                            {tx.title}
                          </h5>
                          <div className="flex gap-1.5 mt-1 items-center">
                            <span className="text-[9px] text-stone-400 font-semibold uppercase">{tx.date}</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300" />
                            <span className="text-[9.5px] text-stone-400 italic line-clamp-1">{tx.category}</span>
                          </div>
                        </div>

                        {/* Cost & action option button */}
                        <div className="text-right flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono tracking-tight ${
                            tx.type === 'savings' || tx.type === 'income'
                              ? 'text-emerald-700'
                              : 'text-stone-800'
                          }`}>
                            {tx.type === 'savings' || tx.type === 'income' ? '+' : '−'}₱{tx.amount.toLocaleString()}
                          </span>

                          {/* Quick bin deletion button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1.5 rounded-lg border border-stone-100 text-stone-300 hover:text-stone-700 hover:border-stone-400 transition-all cursor-pointer shadow-inner bg-stone-50/20 active:scale-95"
                            title="Scrub log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Tab Screen */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-extrabold text-lg text-stone-850 tracking-tight">Your Profile</h3>
                <p className="text-xs text-stone-400 font-semibold">Manage account properties & look and feel theme preferences</p>
              </div>

              {/* Editable Profile Avatar Card */}
              <div className={`p-6 rounded-3xl border transition-all duration-300 ${themeStyles.cardBg} shadow-sm space-y-4`}>
                <div className="flex flex-col items-center text-center space-y-3">
                  
                  {/* Clickable Avatar Slot */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setNewProfileName(userName);
                      setNewProfileInitials(userInitials);
                      playPopSound();
                    }}
                    className="relative cursor-pointer group"
                  >
                    <div className={`w-20 h-20 rounded-2xl ${themeStyles.headerInitials} flex items-center justify-center font-black text-2xl shadow-lg relative tracking-wider transition-all`}>
                      {userInitials}
                      
                      {/* Floating pen icon */}
                      <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-stone-900 border border-stone-800 text-white flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-transform">
                        <Edit2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>

                  {/* Profile Edit Fields or standard display */}
                  {isEditingProfile ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newProfileName.trim()) {
                          const updatedName = newProfileName.trim();
                          // Generate initials gracefully if empty
                          let updatedInitials = newProfileInitials.trim().toUpperCase();
                          if (!updatedInitials) {
                            updatedInitials = updatedName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ME';
                          }
                          setUserName(updatedName);
                          setUserInitials(updatedInitials);
                          localStorage.setItem('dreamphone_username', updatedName);
                          localStorage.setItem('dreamphone_initials', updatedInitials);
                          setIsEditingProfile(false);
                          triggerToast("Profile saved! 💫");
                          playSuccessSound();
                        }
                      }}
                      className="w-full space-y-2.5 max-w-[240px] pt-1"
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block text-left mb-1">Display Name</span>
                        <input
                          type="text"
                          required
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          maxLength={25}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 text-xs font-semibold focus:outline-none focus:border-stone-400 transition-all text-center"
                          placeholder="Maria Joy"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 block text-left mb-1">Initials</span>
                        <input
                          type="text"
                          required
                          value={newProfileInitials}
                          onChange={(e) => setNewProfileInitials(e.target.value.slice(0, 2).toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 text-xs font-mono font-bold focus:outline-none focus:border-stone-400 transition-all text-center"
                          placeholder="MJ"
                          maxLength={2}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            playPopSound();
                          }}
                          className="flex-1 py-1.5 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-500 hover:bg-stone-50 active:scale-95 transition-all text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold leading-none cursor-pointer text-white hover:opacity-90 active:scale-95 transition-all ${
                            themeVibe === 'cosmic' ? 'bg-[#6366f1]' : 'bg-[#1c1917]'
                          }`}
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-0.5">
                      <h4 
                        onClick={() => {
                          setIsEditingProfile(true);
                          setNewProfileName(userName);
                          setNewProfileInitials(userInitials);
                        }}
                        className={`text-base font-black tracking-tight flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-85 ${themeStyles.textTitle}`}
                      >
                        {userName}
                        <Edit2 className="w-3 h-3 text-stone-400" />
                      </h4>
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase ${themeStyles.textMuted}`}>
                        Account Owner
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Today's Balance details section */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-stone-450 mb-3 px-1">Today's Balance</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${themeStyles.cardBg}`}>
                    <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block leading-none">Total Saved</span>
                    <strong className={`text-xl font-black tracking-tight font-mono block mt-2.5 leading-none ${themeVibe === 'cosmic' ? 'text-indigo-400' : 'text-stone-850'}`}>
                      ₱{totalSaved.toLocaleString()}
                    </strong>
                    <p className="text-[10px] text-stone-400 mt-2 font-semibold">In target vaults</p>
                  </div>

                  <div className={`p-4 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${themeStyles.cardBg}`}>
                    <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest block leading-none">Budget Balance</span>
                    <strong className={`text-xl font-black tracking-tight font-mono block mt-2.5 leading-none ${totalBudgetLeft < 500 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₱{totalBudgetLeft.toLocaleString()}
                    </strong>
                    <p className="text-[10px] text-stone-400 mt-2 font-semibold">of ₱{budget.monthlyLimit.toLocaleString()} left</p>
                  </div>
                </div>
              </div>

              {/* Beautiful Interactive Theme Switcher */}
              <div className={`p-5 rounded-3xl border transition-all ${themeStyles.cardBg} shadow-sm space-y-3.5`}>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5 leading-none mb-1">
                    <Palette className="w-4 h-4 text-amber-500" />
                    App Theme Vibe
                  </h4>
                  <p className="text-[10px] text-stone-400 font-semibold">Change colors, borders, and mood instantly</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'golden', name: 'Golden Aura ☀️', itemSpec: 'bg-[#FBF9F5] border-amber-400 text-stone-800' },
                    { id: 'cosmic', name: 'Cosmic Slate 🌌', itemSpec: 'bg-[#1E293B] border-stone-800 text-white' },
                    { id: 'sage', name: 'Sage Forest 🌲', itemSpec: 'bg-[#F2F5F3] border-emerald-800 text-emerald-[#1F3329]' },
                    { id: 'sakura', name: 'Sakura Pink 🌸', itemSpec: 'bg-[#FFF9F9] border-rose-300 text-[#3B1919]' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setThemeVibe(theme.id as any);
                        localStorage.setItem('dreamphone_vibe', theme.id);
                        playSuccessSound();
                        triggerToast(`Switched to ${theme.name}! ✨`);
                      }}
                      className={`px-3 py-2.5 rounded-2xl border text-[11px] font-bold text-left flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                        themeVibe === theme.id 
                          ? `${theme.itemSpec} ring-1 ring-amber-500/20 shadow-md scale-[1.02] border-opacity-95`
                          : 'bg-stone-50/50 border-stone-150 hover:bg-stone-50 text-stone-500'
                      }`}
                    >
                      <span className="truncate leading-none">{theme.name}</span>
                      {themeVibe === theme.id && <span className="text-[10px]">●</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary utility configurations card */}
              <div className={`p-4 rounded-3xl border transition-all ${themeStyles.cardBg} shadow-sm flex items-center justify-between gap-4`}>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-[#A8A29E] block leading-none mb-1">Slide Wizard</span>
                  <p className="text-[10px] font-semibold text-stone-400">Launch welcome interactive guide</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOnboardingOpen(true);
                    playPopSound();
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-bold border cursor-pointer active:scale-95 bg-transparent hover:bg-stone-50/10 text-stone-500 border-stone-200`}
                >
                  Configure
                </button>
              </div>

              {/* Danger zone / Factory Reset Area */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to restore all properties, targets, and data back to defaults? This cannot be undone!")) {
                      handleResetAllData();
                      triggerToast("All data set to factory original! 🧹💫");
                    }
                  }}
                  className="w-full text-center py-2.5 bg-rose-50/50 hover:bg-rose-50/80 text-rose-600 border border-rose-100 rounded-2xl text-[10.5px] font-bold transition-all cursor-pointer active:scale-95"
                >
                  ⚠️ Reset Account to Factory Defaults
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Slide-Up Trigger buttons floating bottom card */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsDepositModalOpen(true); playPopSound(); }}
          className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-50 flex items-center justify-center cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.18)]"
          title="Manual log"
        >
          <Plus className="w-6.5 h-6.5" strokeWidth={2.4} />
        </motion.button>
      </div>

      {/* Cozy, elegant soft/dark Bottom Tab Bar Navigation */}
      <nav className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm ${themeVibe === 'cosmic' ? 'bg-[#1E293B]/90 text-stone-100 border-stone-800' : 'bg-white/80 text-stone-900 border-stone-100/80'} backdrop-blur-lg border shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-3 py-2 rounded-2xl flex justify-between items-center z-30 transition-all`}>
        <button
          type="button"
          onClick={() => handleTabSwitch('home')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[9.5px] font-extrabold tracking-tight cursor-pointer transition-colors relative ${
            activeTab === 'home' ? themeStyles.tabActiveText : themeStyles.tabInactiveText
          }`}
        >
          {activeTab === 'home' && (
            <motion.span 
              layoutId="navTabIndicator"
              className={`absolute inset-0 ${themeVibe === 'cosmic' ? 'bg-stone-800 border-stone-750' : 'bg-[#FAF9F5]/90 border-stone-150/40'} rounded-xl -z-10 border`}
            />
          )}
          <Coins className="w-4.5 h-4.5" />
          Home
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('goals')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[9.5px] font-extrabold tracking-tight cursor-pointer transition-colors relative ${
            activeTab === 'goals' ? themeStyles.tabActiveText : themeStyles.tabInactiveText
          }`}
        >
          {activeTab === 'goals' && (
            <motion.span 
              layoutId="navTabIndicator"
              className={`absolute inset-0 ${themeVibe === 'cosmic' ? 'bg-stone-800 border-stone-750' : 'bg-[#FAF9F5]/90 border-stone-150/40'} rounded-xl -z-10 border`}
            />
          )}
          <Trophy className="w-4.5 h-4.5" />
          Vaults
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('analytics')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[9.5px] font-extrabold tracking-tight cursor-pointer transition-colors relative ${
            activeTab === 'analytics' ? themeStyles.tabActiveText : themeStyles.tabInactiveText
          }`}
        >
          {activeTab === 'analytics' && (
            <motion.span 
              layoutId="navTabIndicator"
              className={`absolute inset-0 ${themeVibe === 'cosmic' ? 'bg-stone-800 border-stone-750' : 'bg-[#FAF9F5]/90 border-stone-150/40'} rounded-xl -z-10 border`}
            />
          )}
          <BarChart3 className="w-4.5 h-4.5" />
          Reports
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('profile')}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 text-[9.5px] font-extrabold tracking-tight cursor-pointer transition-colors relative ${
            activeTab === 'profile' ? themeStyles.tabActiveText : themeStyles.tabInactiveText
          }`}
        >
          {activeTab === 'profile' && (
            <motion.span 
              layoutId="navTabIndicator"
              className={`absolute inset-0 ${themeVibe === 'cosmic' ? 'bg-stone-800 border-stone-750' : 'bg-[#FAF9F5]/90 border-stone-150/40'} rounded-xl -z-10 border`}
            />
          )}
          <User className="w-4.5 h-4.5" />
          Profile
        </button>
      </nav>

      {/* Slide-Up Drawers (Gesture-dismissible bottom sheets) */}
      <AddTransactionModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        goals={goals} 
        onAddTransaction={handleAddCustomTransaction} 
      />

      <AddGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onAddGoal={handleAddNewGoal} 
      />

      {/* Interactive Onboarding Slide Wizard */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <OnboardingSlider
            onComplete={handleOnboardingComplete}
            onClose={() => setIsOnboardingOpen(false)}
            initialData={{
              userName,
              themeVibe
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
