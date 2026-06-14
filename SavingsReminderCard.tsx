import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, Clock, Sparkles, Check, Play, Info } from 'lucide-react';
import { playPopSound, playSuccessSound } from '../utils/audio';

interface SavingsReminderCardProps {
  onTriggerToast: (msg: string) => void;
  userName: string;
  themeVibe: 'golden' | 'cosmic' | 'sage' | 'sakura';
}

export default function SavingsReminderCard({ onTriggerToast, userName, themeVibe }: SavingsReminderCardProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<string>('20:00');
  const [lastTriggeredDate, setLastTriggeredDate] = useState<string>('');
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Load reminder settings on mount
  useEffect(() => {
    const cachedEnabled = localStorage.getItem('dreamphone_reminder_enabled');
    const cachedTime = localStorage.getItem('dreamphone_reminder_time');
    const cachedLastDate = localStorage.getItem('dreamphone_reminder_last_date');

    if (cachedEnabled !== null) {
      setIsEnabled(cachedEnabled === 'true');
    }
    if (cachedTime) {
      setReminderTime(cachedTime);
    }
    if (cachedLastDate) {
      setLastTriggeredDate(cachedLastDate);
    }
  }, []);

  // Check current time every 15 seconds to see if it matches the selected time
  useEffect(() => {
    if (!isEnabled) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      // Format as "HH:MM" matching input (e.g. "08:30" or "20:00")
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const todayStr = now.toDateString(); // e.g. "Sat Jun 13 2026"

      if (currentTimeStr === reminderTime && lastTriggeredDate !== todayStr) {
        // Match! Trigger a satisfying savings motivation toast
        const positiveSayings = [
          `⏰ Hey ${userName}! It's savings time. Let's drop a coin into your goals to keep your savings streak hot! 🔥`,
          `💰 Reminder strike! A fast ₱50 micro-save today gets you one step closer to your dream device! 📱`,
          `🌟 Savings Oracle says: ${userName}, consistency builds fortunes. Save just a little bit right now! 🍀`,
          `✨ Tick-tock! Your savings alarm is sounding. Turn your loose change into future rewards! 🌟`
        ];
        const randomSaying = positiveSayings[Math.floor(Math.random() * positiveSayings.length)];
        
        onTriggerToast(randomSaying);
        playSuccessSound();

        // Update last triggered date to prevent double triggering within the same clock minute
        setLastTriggeredDate(todayStr);
        localStorage.setItem('dreamphone_reminder_last_date', todayStr);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }, [isEnabled, reminderTime, lastTriggeredDate, userName, onTriggerToast]);

  const handleSaveSettings = () => {
    playSuccessSound();
    localStorage.setItem('dreamphone_reminder_enabled', String(isEnabled));
    localStorage.setItem('dreamphone_reminder_time', reminderTime);
    
    setShowSavedFeedback(true);
    onTriggerToast(`⏰ Reminder set for ${reminderTime} daily!`);

    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2000);
  };

  const handleToggle = () => {
    playPopSound();
    const nextVal = !isEnabled;
    setIsEnabled(nextVal);
    localStorage.setItem('dreamphone_reminder_enabled', String(nextVal));
    
    if (nextVal) {
      onTriggerToast(`🔔 Daily savings reminders turned ON`);
    } else {
      onTriggerToast(`🔕 Daily savings reminders turned OFF`);
    }
  };

  const triggerTestReminder = () => {
    playSuccessSound();
    const funQuotes = [
      `⏰ [Test Savings Alarm Alert] "Small deposits of ₱20 or ₱50 build massive momentum. Put your allowance into the Piggy Bank drop zone today!"`,
      `⏰ [Test Alarm Strike] "Hey ${userName}! Dedicate some coins to your dream vault now. Your future self will thank you! 🚀"`,
      `⏰ [Test Motivation] "Consistency is key. Tap 'Add Ipon' or drag coins to stack up savings right now! 🔥"`
    ];
    const picked = funQuotes[Math.floor(Math.random() * funQuotes.length)];
    onTriggerToast(picked);
  };

  // Aesthetic mapping based on current theme style
  const themeColors = {
    cosmic: {
      card: 'bg-stone-900 border-stone-850 text-stone-100',
      tagBg: 'bg-indigo-500/15 text-indigo-300',
      input: 'bg-stone-950 border-stone-800 focus:ring-indigo-500 text-white',
      btnTest: 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700/60',
      btnSave: 'bg-indigo-600 hover:bg-indigo-550 text-white',
      desc: 'text-stone-400',
    },
    sage: {
      card: 'bg-white border-[#E3ECE7] text-[#1F3329]',
      tagBg: 'bg-emerald-50 text-emerald-805 border border-emerald-100',
      input: 'bg-[#F2F5F3] border-[#DFE5E1] focus:ring-emerald-650 text-[#1F3329]',
      btnTest: 'bg-stone-50 hover:bg-stone-100 text-[#5A6E64] border-stone-200/80',
      btnSave: 'bg-[#1F3329] hover:bg-[#2C483A] text-white',
      desc: 'text-[#5A6E64]',
    },
    sakura: {
      card: 'bg-white border-[#FAE6E6] text-[#3B1919]',
      tagBg: 'bg-rose-50 text-rose-800 border border-rose-100',
      input: 'bg-[#FFF9F9] border-[#F8E3E3] focus:ring-rose-500 text-[#3B1919]',
      btnTest: 'bg-rose-50/40 hover:bg-rose-50 text-[#8C5A5A] border-rose-100',
      btnSave: 'bg-rose-600 hover:bg-rose-550 text-white',
      desc: 'text-[#8C5A5A]',
    },
    golden: {
      card: 'bg-white border-stone-100 text-stone-850',
      tagBg: 'bg-amber-50 text-amber-800 border border-amber-150',
      input: 'bg-[#FAF9F5]/40 border-stone-200 focus:ring-amber-500 text-stone-900',
      btnTest: 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200/60',
      btnSave: 'bg-stone-900 hover:bg-stone-800 text-white',
      desc: 'text-stone-400',
    }
  }[themeVibe] || {
    card: 'bg-white border-stone-100 text-stone-850',
    tagBg: 'bg-amber-50 text-amber-800 border border-amber-150',
    input: 'bg-[#FAF9F5]/40 border-stone-200 focus:ring-amber-500 text-stone-900',
    btnTest: 'bg-stone-50 hover:bg-stone-100 text-stone-500 border-stone-200/60',
    btnSave: 'bg-stone-900 hover:bg-stone-800 text-white',
    desc: 'text-stone-400',
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all duration-300 ${themeColors.card} shadow-sm relative overflow-hidden`}>
      {/* Abstract warm ring designs */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-400/5 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-indigo-400/5 blur-lg pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center">
            <Clock className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 leading-none mb-1">Savings Reminder</h4>
            <span className="text-[10.5px] text-stone-400 font-semibold leading-none">Form a daily saving habit</span>
          </div>
        </div>

        {/* Master Enabled Slider/Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            isEnabled
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          }`}
        >
          {isEnabled ? (
            <>
              <Bell className="w-3.5 h-3.5 text-white animate-bounce-slow" />
              Active
            </>
          ) : (
            <>
              <BellOff className="w-3.5 h-3.5 text-stone-400" />
              Disabled
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <p className={`text-[11px] leading-relaxed ${themeColors.desc}`}>
          Keep your savings streak alive! Pick a specific hour, and our on-screen alarm encourage you with rich coin motivation drops.
        </p>

        <div className="flex items-center gap-3.5">
          <div className="flex-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-stone-400 block mb-1 px-1">Daily trigger time:</label>
            <div className="relative">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => {
                  setReminderTime(e.target.value);
                  playPopSound();
                }}
                disabled={!isEnabled}
                className={`w-full rounded-2xl px-3.5 py-2.5 text-xs font-black font-mono focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  themeColors.input
                } ${!isEnabled ? 'opacity-55 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 self-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={!isEnabled}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer ${
                themeColors.btnSave
              } ${!isEnabled ? 'opacity-55 cursor-not-allowed' : ''}`}
            >
              {showSavedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  Saved
                </>
              ) : (
                'Save Alarm'
              )}
            </button>
          </div>
        </div>

        {/* Informative footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100/60 text-[10px]">
          <span className="text-stone-400 italic flex items-center gap-1 leading-none">
            <Info className="w-3 h-3 text-stone-400 flex-shrink-0" />
            Checks local device clock
          </span>

          <button
            type="button"
            onClick={triggerTestReminder}
            className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-bold border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              themeColors.btnTest
            }`}
          >
            <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" />
            Try Alarm Demo
          </button>
        </div>
      </div>
    </div>
  );
}
