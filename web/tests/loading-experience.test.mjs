import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function readWebFile(relPath) {
  return fs.readFileSync(path.join(webRoot, relPath), 'utf-8');
}

describe('Phase 7: Loading Experience & Reduced-Motion Architecture', () => {
  describe('1. LoadingSpinner Component Refinement & Reduced-Motion Compliance', () => {
    it('should verify LoadingSpinner.js exists and exports default function', () => {
      const content = readWebFile('src/components/ui/LoadingSpinner.js');
      assert.ok(content.includes('export default function LoadingSpinner'), 'Must export default LoadingSpinner');
    });

    it('should verify fullscreen prop support and elimination of z-[9999]', () => {
      const content = readWebFile('src/components/ui/LoadingSpinner.js');
      assert.ok(content.includes('fullscreen = true'), 'Must support configurable fullscreen prop');
      assert.ok(content.includes('z-50'), 'Must use reasonable z-50 overlay instead of aggressive z-[9999]');
      assert.ok(!content.includes('z-[9999]'), 'Must not contain z-[9999]');
    });

    it('should verify strict prefers-reduced-motion guards on all animations', () => {
      const content = readWebFile('src/components/ui/LoadingSpinner.js');
      assert.ok(content.includes('motion-safe:animate-ping'), 'Halo must use motion-safe:animate-ping');
      assert.ok(content.includes('motion-reduce:scale-100'), 'Halo must have motion-reduce fallback');
      assert.ok(content.includes('motion-safe:animate-spin'), 'Outer ring must use motion-safe:animate-spin');
      assert.ok(content.includes('motion-safe:animate-pulse'), 'Label must use motion-safe:animate-pulse');
      assert.ok(content.includes('motion-reduce:animate-none'), 'Label must disable pulse on reduced motion');
    });

    it('should verify WCAG status role and aria-live semantics', () => {
      const content = readWebFile('src/components/ui/LoadingSpinner.js');
      assert.ok(content.includes('role="status"'), 'Must specify role="status"');
      assert.ok(content.includes('aria-live="polite"'), 'Must specify aria-live="polite"');
    });
  });

  describe('2. Skeleton Primitive & Contextual Skeleton Implementations', () => {
    it('should verify Skeleton.js primitive with semantic tokens and reduced-motion support', () => {
      const content = readWebFile('src/components/ui/Skeleton.js');
      assert.ok(content.includes('motion-safe:animate-pulse'), 'Must use motion-safe:animate-pulse');
      assert.ok(content.includes('motion-reduce:animate-none'), 'Must use motion-reduce:animate-none');
      assert.ok(content.includes('aria-hidden="true"'), 'Must declare aria-hidden="true" for decorative placeholders');
      assert.ok(content.includes('bg-slate-200/70') && content.includes('dark:bg-slate-800/70'), 'Must use semantic surface tokens');
    });

    it('should verify DashboardSkeleton preserves TopNav and mimics card anatomy', () => {
      const content = readWebFile('src/components/ui/DashboardSkeleton.js');
      assert.ok(content.includes('<TopNav'), 'Must include persistent TopNav to prevent layout shift');
      assert.ok(content.includes('border-t-[3px]'), 'Must mirror card top border design token');
      assert.ok(content.includes('aria-busy="true"'), 'Must declare aria-busy="true" on loading container');
    });

    it('should verify HabitsSkeleton preserves TopNav and RoutineCard anatomy', () => {
      const content = readWebFile('src/components/ui/HabitsSkeleton.js');
      assert.ok(content.includes('<TopNav'), 'Must include persistent TopNav');
      assert.ok(content.includes('pb-32 sm:pb-36'), 'Must preserve bottom clearance for FAB and BottomNav');
    });

    it('should verify AnalyticsSkeleton preserves TopNav, tabs, and metrics grid', () => {
      const content = readWebFile('src/components/ui/AnalyticsSkeleton.js');
      assert.ok(content.includes('<TopNav'), 'Must include persistent TopNav');
      assert.ok(content.includes('grid grid-cols-2'), 'Must mirror 2-metric card grid');
    });

    it('should verify UI index exports all contextual skeleton components', () => {
      const content = readWebFile('src/components/ui/index.js');
      assert.ok(content.includes("export { default as Skeleton } from './Skeleton'"));
      assert.ok(content.includes("export { default as DashboardSkeleton } from './DashboardSkeleton'"));
      assert.ok(content.includes("export { default as HabitsSkeleton } from './HabitsSkeleton'"));
      assert.ok(content.includes("export { default as AnalyticsSkeleton } from './AnalyticsSkeleton'"));
    });
  });

  describe('3. Route Transition & Page-Level Loading Integration', () => {
    it('should verify dashboard loading.js renders DashboardSkeleton instead of full-screen spinner', () => {
      const content = readWebFile('src/app/(protected)/dashboard/loading.js');
      assert.ok(content.includes('<DashboardSkeleton />'), 'Dashboard loading must render DashboardSkeleton');
      assert.ok(!content.includes('LoadingSpinner'), 'Must not render LoadingSpinner in route loading.js');
    });

    it('should verify habits loading.js renders HabitsSkeleton instead of full-screen spinner', () => {
      const content = readWebFile('src/app/(protected)/habits/loading.js');
      assert.ok(content.includes('<HabitsSkeleton />'), 'Habits loading must render HabitsSkeleton');
      assert.ok(!content.includes('LoadingSpinner'), 'Must not render LoadingSpinner in route loading.js');
    });

    it('should verify analytics loading.js renders AnalyticsSkeleton instead of full-screen spinner', () => {
      const content = readWebFile('src/app/(protected)/analytics/loading.js');
      assert.ok(content.includes('<AnalyticsSkeleton />'), 'Analytics loading must render AnalyticsSkeleton');
      assert.ok(!content.includes('LoadingSpinner'), 'Must not render LoadingSpinner in route loading.js');
    });

    it('should verify DashboardPage uses DashboardSkeleton during data loading', () => {
      const content = readWebFile('src/app/(protected)/dashboard/page.js');
      assert.ok(content.includes('<DashboardSkeleton />'), 'DashboardPage must render DashboardSkeleton when loading');
      assert.ok(!content.includes('return <LoadingSpinner />'), 'DashboardPage must not return LoadingSpinner');
    });

    it('should verify HabitsPage preserves LoadingSpinner fallback for foundation loading architecture', () => {
      const content = readWebFile('src/app/(protected)/habits/page.js');
      assert.ok(content.includes('return <LoadingSpinner />;'), 'HabitsPage must retain LoadingSpinner for foundation loading');
    });

    it('should verify AnalyticsPage uses AnalyticsSkeleton during data loading', () => {
      const content = readWebFile('src/app/(protected)/analytics/page.js');
      assert.ok(content.includes('<AnalyticsSkeleton />'), 'AnalyticsPage must render AnalyticsSkeleton when loading');
    });
  });
});
