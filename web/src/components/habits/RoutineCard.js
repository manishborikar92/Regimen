'use client';

import { memo } from 'react';
import { Clock, Repeat, ListChecks, Pencil, Trash2 } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/categories';
import { getTimingDisplay, getFrequencyDisplay } from '@/utils/date-helpers';

/**
 * RoutineCard — Authoritative routine component for the Routine Manager (/habits).
 *
 * Implements:
 * - Integrated category-specific top border (border-t-[3px]) matching Dashboard cards
 * - Clear responsive information hierarchy with unconstrained title and instructions
 * - Compact recurrence indicator preventing narrow-screen wrapping
 * - WCAG 2.2 compliant touch targets (min 44x44px) for Edit and Delete actions
 */
function RoutineCard({ habit, onEdit, onDelete }) {
  if (!habit) return null;

  const config = getCategoryConfig(habit.category);
  const timingText = getTimingDisplay(habit);
  const frequencyText = getFrequencyDisplay(habit.frequency);
  const isPersonal = habit.seedOrigin === 'personal_preset' || habit.stableKey?.startsWith('canonical_');
  const isFoundation = !isPersonal && Boolean(habit.stableKey || habit.isSystemSeed);

  return (
    <div
      className={`bg-surface rounded-2xl p-4 sm:p-5 shadow-2xs border border-subtle border-t-[3px] ${
        config.borderTopColor || 'border-t-teal-600 dark:border-t-teal-400'
      } hover:shadow-sm transition-shadow`}
    >
      {/* Header row: Categories, Tags, and Action buttons */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`text-2xs sm:text-xs px-2.5 py-0.5 rounded-full font-semibold border ${config.badgeClasses}`}>
            {habit.category}
          </span>

          {isPersonal && (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              Personal
            </span>
          )}

          {isFoundation && (
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-surface-subtle text-sub border border-subtle">
              Foundation
            </span>
          )}

          <span className="text-2xs text-muted font-medium bg-surface-subtle/80 border border-subtle/60 px-1.5 py-0.5 rounded">
            #{habit.order}
          </span>
        </div>

        {/* Action buttons: Edit & Delete (WCAG min 44x44px touch targets) */}
        <div className="flex items-center gap-1 -mr-1 -mt-1 sm:mr-0 sm:mt-0 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit?.(habit)}
            className="p-2.5 flex items-center justify-center text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            title="Edit Routine"
            aria-label={`Edit ${habit.title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(habit.id)}
            className="p-2.5 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Delete Routine"
            aria-label={`Delete ${habit.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content area: Title & Instructions */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-main leading-snug">
          {habit.title}
        </h3>

        {habit.instructions && (
          <p className="text-xs sm:text-sm text-sub mt-1 whitespace-pre-line leading-relaxed">
            {habit.instructions}
          </p>
        )}
      </div>

      {/* Metadata & Recurrence row */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-subtle/60">
        <span className="inline-flex items-center gap-1.5 text-2xs sm:text-xs text-sub bg-surface-subtle border border-subtle px-2 py-0.5 rounded-md font-medium">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{timingText}</span>
        </span>

        <span
          className="inline-flex items-center gap-1.5 text-2xs sm:text-xs text-sub bg-surface-subtle border border-subtle px-2 py-0.5 rounded-md font-medium"
          title={habit.frequency ? `Active on: ${habit.frequency.join(', ')}` : 'Active every day'}
        >
          <Repeat className="w-3 h-3 text-slate-400" />
          <span>{frequencyText}</span>
        </span>

        {habit.checklistItems?.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-2xs sm:text-xs text-teal-700 dark:text-teal-400 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 px-2 py-0.5 rounded-md font-medium">
            <ListChecks className="w-3 h-3" />
            <span>{habit.checklistItems.length} checklist steps configured</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(RoutineCard);
