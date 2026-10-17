/**
 * Server-Only Module: Personalized Routine Schedule for Manish Borikar.
 * Re-exports authoritative definitions from the consolidated schedule-templates.js module.
 * 
 * Note: Pure Node ESM module without 'server-only' package import to ensure
 * flawless execution in both Next.js App Router Route Handlers and standalone Node CLI scripts.
 */

export {
  OSHO_LIBRARY,
  OSHO_GROUPS,
  MOVEMENT_SCHEDULE,
  WORKOUT_EXERCISES,
  WALK_DAY_ROUTINE,
  PROGRESSION_PHASES,
  READINESS_CRITERIA,
  STOP_SIGNALS,
  GENERAL_HEALTH_NOTES,
  MANISH_PERSONAL_ROUTINES,
  CANONICAL_ROUTINES,
} from './schedule-templates.js';
