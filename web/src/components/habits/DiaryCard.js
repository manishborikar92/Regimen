'use client';

import { useState, memo } from 'react';
import { PenTool, Check, Clock, Lock, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';

const PROMPTS = [
  'What happened or what thought came to mind?',
  'What did I feel?',
  'What assumption might I be making?',
  'What did I learn?',
  'Is there a small next step?',
];

function DiaryCard({ habit, isCompleted, onToggle, progress = {}, onUpdateProgress }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [entryText, setEntryText] = useState(progress.entryText || '');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const config = getCategoryConfig(habit.category);

  const handleSaveEntry = () => {
    onUpdateProgress(habit.id, {
      ...progress,
      entryText,
    }, true); // Saving journal entry marks the activity complete
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const insertPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    const prefix = entryText ? `${entryText}\n\n• ${prompt}\n` : `• ${prompt}\n`;
    setEntryText(prefix);
  };

  return (
    <div
      className={`relative rounded-xl border border-t-[3px] bg-surface shadow-xs transition-all duration-200 hover:shadow-sm ${
        isCompleted
          ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/80 border-t-rose-500 dark:border-t-rose-400'
          : 'border-subtle border-t-rose-500 dark:border-t-rose-400'
      }`}
    >
      <div className="p-3.5 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-medium border ${config.badgeClasses}`}>
                {habit.category}
              </span>
              <span className="flex items-center gap-1 text-2xs sm:text-xs text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60 font-medium">
                <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                Private to You
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
              <PenTool className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>{habit.title}</span>
            </h3>

            <p className="text-xs text-sub mt-0.5 leading-relaxed">
              Private daily reflection & observations • A short note is completely fine
            </p>
          </div>

          {/* Quick Completion Button */}
          <div className="flex flex-col items-end flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => onToggle(habit.id)}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                  : 'border-stone-300 dark:border-stone-600 hover:border-rose-500 text-transparent'
              }`}
              aria-label={isCompleted ? 'Mark diary incomplete' : 'Mark diary complete'}
            >
              {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* In-App Journal Editor Toggle */}
        <div className="mt-2.5 pt-2 border-t border-stone-200/80 dark:border-stone-800/80">
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="min-h-[44px] py-2 flex items-center justify-between w-full text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              {isEditorOpen
                ? 'Collapse Private Journal'
                : entryText
                ? 'View / Edit Today\'s Journal Entry'
                : 'Write Today\'s Private Reflection'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isEditorOpen ? 'rotate-180' : ''}`} />
          </button>

          {isEditorOpen && (
            <div className="mt-2 p-3 sm:p-3.5 bg-rose-50/40 dark:bg-rose-950/30 rounded-xl border border-rose-200/70 dark:border-rose-900/40 space-y-3">
              {/* Optional Reflection Prompts */}
              <div>
                <span className="text-2xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider block mb-1.5">
                  Optional Reflection Prompts (tap to insert):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertPrompt(prompt)}
                      className="text-2xs min-h-[32px] px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-rose-100/70 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 rounded-full transition-colors text-left flex items-center"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="What happened today? What did you feel or notice? What assumption might you be examining? Write as briefly or deeply as feels right..."
                rows={4}
                className="w-full p-3 bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-800/60 rounded-lg text-base sm:text-xs text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-rose-500 focus:border-transparent leading-relaxed placeholder-stone-400"
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-2xs text-stone-400 dark:text-stone-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-400 dark:text-stone-500" />
                  Entries remain completely private on your device & account.
                </span>

                <div className="flex items-center gap-2">
                  {savedFeedback && (
                    <span className="text-2xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveEntry}
                    className="min-h-[44px] px-4 py-2.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs flex items-center justify-center"
                  >
                    Save & Mark Complete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DiaryCard);
