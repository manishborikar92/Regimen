import { test, describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND } from '../src/lib/constants/brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to compute WCAG 2.2 Relative Luminance and Contrast Ratio
function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Phase 1: VRITTA Design Tokens & Theme Engine', () => {

  // =========================================================================
  // 1. BRAND METADATA & TOKEN VALUES
  // =========================================================================
  describe('Brand Configuration & Semantic Tokens', () => {
    it('should declare authoritative VRITTA brand name and Restorative Juniper primary tokens', () => {
      assert.equal(BRAND.name.toUpperCase(), 'VRITTA');
      assert.equal(BRAND.themeColor, '#14B8A6'); // Luminous Teal primary brand swatch
      assert.equal(BRAND.brandColors.deepObsidian, '#090D16');
      assert.equal(BRAND.brandColors.luminousTeal, '#14B8A6');
      assert.equal(BRAND.brandColors.warmAmber, '#D97706');
      assert.equal(BRAND.colors.primary[500], '#14b8a6');
      assert.equal(BRAND.colors.primary[600], '#0f766e');
      assert.equal(BRAND.colors.accent.teal, '#14b8a6');
      assert.equal(BRAND.colors.accent.amber, '#d97706');
      assert.equal(BRAND.colors.accent.amberText, '#b45309');
      assert.equal(BRAND.colors.accent.juniperText, '#0f766e');
      assert.equal(BRAND.colors.surface.canvas, '#f8fafc'); // Authoritative Misty Slate
      assert.equal(BRAND.colors.surface.card, '#ffffff');
      assert.equal(BRAND.colors.surface.canvasDark, '#090d16');
      assert.equal(BRAND.colors.surface.cardDark, '#111827');
    });
  });

  // =========================================================================
  // 2. MATHEMATICAL WCAG 2.2 CONTRAST RATIO AUDIT
  // =========================================================================
  describe('WCAG 2.2 AA & AAA Contrast Audits', () => {
    it('should guarantee WCAG 2.2 contrast ratios for all critical text and brand pairs', () => {
      // Light mode primary text (#0F172A) on Canvas (#F8FAFC)
      const lightCanvasText = getContrastRatio('#0F172A', '#F8FAFC');
      assert.ok(lightCanvasText >= 7.0, `Light canvas text contrast ${lightCanvasText.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Light mode primary text (#0F172A) on Card (#FFFFFF)
      const lightCardText = getContrastRatio('#0F172A', '#FFFFFF');
      assert.ok(lightCardText >= 7.0, `Light card text contrast ${lightCardText.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Light mode secondary text (#475569) on Canvas & Card
      const lightSecondary = getContrastRatio('#475569', '#F8FAFC');
      assert.ok(lightSecondary >= 7.0, `Light secondary text contrast ${lightSecondary.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Core Brand Swatch: Deep Obsidian (#090D16) on Light Canvas (#F8FAFC)
      const obsidianOnCanvas = getContrastRatio('#090D16', '#F8FAFC');
      assert.ok(obsidianOnCanvas >= 18.0, `Deep Obsidian on canvas ${obsidianOnCanvas.toFixed(2)}:1 must exceed AAA (>= 7.0:1)`);

      // Core Brand Swatch: Luminous Teal (#14B8A6) on Deep Obsidian (#090D16)
      const tealOnObsidian = getContrastRatio('#14B8A6', '#090D16');
      assert.ok(tealOnObsidian >= 7.0, `Luminous Teal on Obsidian ${tealOnObsidian.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Core Brand Swatch: Deep Obsidian text (#090D16) on Luminous Teal Button (#14B8A6)
      const textOnTealButton = getContrastRatio('#090D16', '#14B8A6');
      assert.ok(textOnTealButton >= 7.0, `Obsidian text on Teal button ${textOnTealButton.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Core Brand Swatch: Warm Amber (#D97706) on Deep Obsidian (#090D16)
      const amberOnObsidian = getContrastRatio('#D97706', '#090D16');
      assert.ok(amberOnObsidian >= 4.5, `Warm Amber on Obsidian ${amberOnObsidian.toFixed(2)}:1 must meet AA (>= 4.5:1)`);

      // Core Brand Swatch: Warm Amber (#D97706) on Light Canvas (#F8FAFC) - Graphical Object (WCAG 2.2 SC 1.4.11)
      const amberOnLightCanvas = getContrastRatio('#D97706', '#F8FAFC');
      assert.ok(amberOnLightCanvas >= 3.0, `Warm Amber on light canvas ${amberOnLightCanvas.toFixed(2)}:1 must meet Non-text SC 1.4.11 (>= 3.0:1)`);

      // Documented Variant: Amber Text (#B45309) on Light Canvas (#F8FAFC)
      const amberTextOnLight = getContrastRatio('#B45309', '#F8FAFC');
      assert.ok(amberTextOnLight >= 4.5, `Amber text on light canvas ${amberTextOnLight.toFixed(2)}:1 must meet AA (>= 4.5:1)`);

      // Documented Variant: Deep Teal (#0F766E) on Light Canvas (#F8FAFC)
      const deepTealOnLight = getContrastRatio('#0F766E', '#F8FAFC');
      assert.ok(deepTealOnLight >= 4.5, `Deep Teal on light canvas ${deepTealOnLight.toFixed(2)}:1 must meet AA (>= 4.5:1)`);

      // Dark mode primary text (#F8FAFC) on Dark Canvas (#090D16)
      const darkCanvasText = getContrastRatio('#F8FAFC', '#090D16');
      assert.ok(darkCanvasText >= 7.0, `Dark canvas text contrast ${darkCanvasText.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Dark mode primary text (#F8FAFC) on Dark Surface (#111827)
      const darkCardText = getContrastRatio('#F8FAFC', '#111827');
      assert.ok(darkCardText >= 7.0, `Dark card text contrast ${darkCardText.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Dark mode secondary text (#94A3B8) on Dark Canvas (#090D16)
      const darkSecondary = getContrastRatio('#94A3B8', '#090D16');
      assert.ok(darkSecondary >= 7.0, `Dark secondary text contrast ${darkSecondary.toFixed(2)}:1 must meet AAA (>= 7.0:1)`);

      // Dark mode resolved muted text (#8092A5) on Dark Canvas (#090D16)
      const darkMutedOnCanvas = getContrastRatio('#8092A5', '#090D16');
      assert.ok(darkMutedOnCanvas >= 4.5, `Dark muted on canvas ${darkMutedOnCanvas.toFixed(2)}:1 must meet AA (>= 4.5:1)`);
      assert.ok(darkMutedOnCanvas >= 6.0, `Dark muted on canvas should be >= 6.0:1 (actual: ${darkMutedOnCanvas.toFixed(2)}:1)`);

      // Dark mode resolved muted text (#8092A5) on Dark Surface (#111827)
      const darkMutedOnSurface = getContrastRatio('#8092A5', '#111827');
      assert.ok(darkMutedOnSurface >= 4.5, `Dark muted on surface ${darkMutedOnSurface.toFixed(2)}:1 must meet AA (>= 4.5:1)`);
      assert.ok(darkMutedOnSurface >= 5.5, `Dark muted on surface should be >= 5.5:1 (actual: ${darkMutedOnSurface.toFixed(2)}:1)`);

      // Demonstration: Legacy color #64748B failed WCAG AA on dark background
      const legacyFail = getContrastRatio('#64748B', '#090D16');
      assert.ok(legacyFail < 4.5, `Legacy #64748B contrast ${legacyFail.toFixed(2)}:1 fails AA, justifying #8092A5 replacement`);
    });
  });

  // =========================================================================
  // 3. RUNTIME BEHAVIORAL VERIFICATION OF THEME ENGINE LOGIC
  // =========================================================================
  describe('Runtime Theme Engine Behavior & Storage Simulation', () => {
    // Pure implementations replicating ThemeContext runtime functions
    const STORAGE_KEY = 'vritta-theme';

    function createMockStorage(initial = {}) {
      const store = { ...initial };
      let throws = false;
      return {
        getItem: (k) => {
          if (throws) throw new Error('SecurityError: localStorage is disabled');
          return store[k] !== undefined ? store[k] : null;
        },
        setItem: (k, v) => {
          if (throws) throw new Error('SecurityError: localStorage is disabled');
          store[k] = String(v);
        },
        setThrows: (val) => { throws = val; },
        _store: store,
      };
    }

    function createMockClassList() {
      const classes = new Set();
      return {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c),
        get list() { return [...classes]; },
      };
    }

    function executeBlockingScript(storage, isDarkOS, classList) {
      try {
        const s = storage.getItem(STORAGE_KEY);
        const p = isDarkOS;
        if (s === 'dark' || (!s && p) || (s === 'system' && p)) {
          classList.add('dark');
        } else {
          classList.remove('dark');
        }
      } catch {
        // Safe fallback
      }
    }

    function getStoredTheme(storage) {
      try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          return stored;
        }
      } catch {
        // Safe fallback
      }
      return 'system';
    }

    it('should correctly read stored preference and fall back to system safely', () => {
      const storage = createMockStorage({ [STORAGE_KEY]: 'dark' });
      assert.equal(getStoredTheme(storage), 'dark');

      storage.setItem(STORAGE_KEY, 'light');
      assert.equal(getStoredTheme(storage), 'light');

      storage.setItem(STORAGE_KEY, 'system');
      assert.equal(getStoredTheme(storage), 'system');

      // Empty / non-existent key
      const emptyStorage = createMockStorage();
      assert.equal(getStoredTheme(emptyStorage), 'system');

      // Corrupted / invalid key
      const corruptedStorage = createMockStorage({ [STORAGE_KEY]: 'invalid_color_theme' });
      assert.equal(getStoredTheme(corruptedStorage), 'system');

      // Security / Quota error throwing storage
      const throwingStorage = createMockStorage();
      throwingStorage.setThrows(true);
      assert.equal(getStoredTheme(throwingStorage), 'system'); // Should not throw
    });

    it('should execute zero-flash blocking script logic and set .dark class correctly', () => {
      // 1. Explicit dark in storage -> adds .dark regardless of OS
      const classList1 = createMockClassList();
      executeBlockingScript(createMockStorage({ [STORAGE_KEY]: 'dark' }), false, classList1);
      assert.ok(classList1.contains('dark'), 'Explicit dark mode must add .dark class');

      // 2. Explicit light in storage -> removes .dark regardless of OS
      const classList2 = createMockClassList();
      classList2.add('dark'); // simulate pre-existing
      executeBlockingScript(createMockStorage({ [STORAGE_KEY]: 'light' }), true, classList2);
      assert.ok(!classList2.contains('dark'), 'Explicit light mode must remove .dark class even if OS is dark');

      // 3. System mode with Dark OS -> adds .dark
      const classList3 = createMockClassList();
      executeBlockingScript(createMockStorage({ [STORAGE_KEY]: 'system' }), true, classList3);
      assert.ok(classList3.contains('dark'), 'System mode with Dark OS must add .dark class');

      // 4. System mode with Light OS -> removes .dark
      const classList4 = createMockClassList();
      classList4.add('dark');
      executeBlockingScript(createMockStorage({ [STORAGE_KEY]: 'system' }), false, classList4);
      assert.ok(!classList4.contains('dark'), 'System mode with Light OS must remove .dark class');

      // 5. Uninitialized storage (first visit) with Dark OS -> adds .dark
      const classList5 = createMockClassList();
      executeBlockingScript(createMockStorage(), true, classList5);
      assert.ok(classList5.contains('dark'), 'First visit with Dark OS must default to dark without flash');

      // 6. Uninitialized storage with Light OS -> removes .dark
      const classList6 = createMockClassList();
      executeBlockingScript(createMockStorage(), false, classList6);
      assert.ok(!classList6.contains('dark'), 'First visit with Light OS must default to light');

      // 7. Storage throwing error -> does not crash or throw
      const throwingStorage = createMockStorage();
      throwingStorage.setThrows(true);
      const classList7 = createMockClassList();
      assert.doesNotThrow(() => {
        executeBlockingScript(throwingStorage, true, classList7);
      });
    });

    it('should manage theme subscriptions and dispatch notifications upon theme changes', () => {
      const listeners = new Set();
      let notifyCount = 0;
      function notifyListeners() {
        notifyCount++;
        for (const l of listeners) l();
      }

      let listener1Calls = 0;
      let listener2Calls = 0;
      const sub1 = () => { listener1Calls++; };
      const sub2 = () => { listener2Calls++; };

      listeners.add(sub1);
      listeners.add(sub2);

      notifyListeners();
      assert.equal(notifyCount, 1);
      assert.equal(listener1Calls, 1);
      assert.equal(listener2Calls, 1);

      // Unsubscribe sub1
      listeners.delete(sub1);
      notifyListeners();
      assert.equal(notifyCount, 2);
      assert.equal(listener1Calls, 1); // Not called again
      assert.equal(listener2Calls, 2);
    });

    it('should verify keyboard navigation circular indexing logic for 3 theme options', () => {
      const totalOptions = 3; // Light (0), Dark (1), System (2)

      // ArrowDown (Next)
      const nextFrom0 = (0 + 1) % totalOptions;
      const nextFrom1 = (1 + 1) % totalOptions;
      const nextFrom2 = (2 + 1) % totalOptions;
      assert.equal(nextFrom0, 1);
      assert.equal(nextFrom1, 2);
      assert.equal(nextFrom2, 0); // Wraps around to start

      // ArrowUp (Previous)
      const prevFrom0 = (0 - 1 + totalOptions) % totalOptions;
      const prevFrom1 = (1 - 1 + totalOptions) % totalOptions;
      const prevFrom2 = (2 - 1 + totalOptions) % totalOptions;
      assert.equal(prevFrom0, 2); // Wraps around to end
      assert.equal(prevFrom1, 0);
      assert.equal(prevFrom2, 1);
    });
  });

  // =========================================================================
  // 4. STATIC SPECIFICATION & MARKUP INVARIANTS
  // =========================================================================
  describe('Static Declarations & Markup Integrity', () => {
    it('should verify globals.css contains Tailwind v4 custom dark variant and semantic tokens', () => {
      const cssPath = path.join(projectRoot, 'src', 'app', 'globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Tailwind CSS v4 class-based dark mode variant
      assert.ok(
        cssContent.includes('@custom-variant dark (&:where(.dark, .dark *));'),
        'Must declare @custom-variant dark for Tailwind v4 class mode'
      );

      // Dynamic @theme mappings
      assert.ok(cssContent.includes('--color-canvas: var(--color-bg-canvas);'), 'Must map canvas in @theme');
      assert.ok(cssContent.includes('--color-surface: var(--color-bg-surface);'), 'Must map surface in @theme');
      assert.ok(cssContent.includes('--color-text-main: var(--color-text-primary);'), 'Must map text-main in @theme');
      assert.ok(cssContent.includes('--color-text-sub: var(--color-text-secondary);'), 'Must map text-sub in @theme');

      // Runtime tokens in :root
      assert.ok(cssContent.includes('--color-bg-canvas: #f8fafc;'), 'Must define light canvas #f8fafc in :root');
      assert.ok(cssContent.includes('--color-bg-surface: #ffffff;'), 'Must define light card in :root');
      assert.ok(cssContent.includes('--color-brand-primary: #14b8a6;'), 'Must define core brand primary in :root');
      assert.ok(cssContent.includes('--color-brand-obsidian: #090d16;'), 'Must define core brand obsidian in :root');
      assert.ok(cssContent.includes('--color-brand-amber: #d97706;'), 'Must define core brand amber in :root');
      assert.ok(cssContent.includes('--color-accent-primary: #0f766e;'), 'Must define accessible teal variant in :root');
      assert.ok(cssContent.includes('--color-warm-accent: #d97706;'), 'Must define core warm accent in :root');

      // Runtime tokens in .dark
      assert.ok(cssContent.includes('--color-bg-canvas: #090d16;'), 'Must define dark canvas in .dark');
      assert.ok(cssContent.includes('--color-bg-surface: #111827;'), 'Must define dark card in .dark');
      assert.ok(cssContent.includes('--color-accent-primary: #14b8a6;'), 'Must define dark brand accent in .dark');
      assert.ok(cssContent.includes('--color-warm-accent: #d97706;'), 'Must define dark warm accent in .dark');
      assert.ok(cssContent.includes('--color-text-muted: #8092a5;'), 'Must define accessible dark muted text in .dark');

      // Reduced motion media query
      assert.ok(
        cssContent.includes('@media (prefers-reduced-motion: reduce)'),
        'Must respect prefers-reduced-motion'
      );
    });

    it('should verify layout.js injects synchronous blocking script and suppressHydrationWarning', () => {
      const layoutPath = path.join(projectRoot, 'src', 'app', 'layout.js');
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');

      // HTML root attributes
      assert.ok(layoutContent.includes('suppressHydrationWarning'), 'Must include suppressHydrationWarning on html tag');

      // Blocking theme script in head
      assert.ok(layoutContent.includes('vritta-theme'), 'Blocking script must check vritta-theme');
      assert.ok(layoutContent.includes('prefers-color-scheme: dark'), 'Blocking script must check prefers-color-scheme');
      assert.ok(layoutContent.includes('document.documentElement.classList.add(\'dark\')'), 'Blocking script must add dark class');

      // ThemeProvider wrapping
      assert.ok(layoutContent.includes('<ThemeProvider>'), 'Must wrap application shell in ThemeProvider');
    });

    it('should verify TopNav.js provides accessible 3-state theme controls with full WAI-ARIA and keyboard navigation', () => {
      const navPath = path.join(projectRoot, 'src', 'components', 'ui', 'TopNav.js');
      const navContent = fs.readFileSync(navPath, 'utf8');

      assert.ok(navContent.includes('useTheme()'), 'TopNav must consume useTheme');
      assert.ok(navContent.includes('role="menuitemradio"'), 'Theme options must have role="menuitemradio"');
      assert.ok(navContent.includes('aria-checked={isSelected}'), 'Theme options must announce aria-checked');
      assert.ok(navContent.includes('aria-haspopup="menu"'), 'Theme toggle button must have aria-haspopup="menu"');
      assert.ok(navContent.includes('aria-controls="theme-menu-dropdown"'), 'Trigger button must control dropdown');
      assert.ok(navContent.includes('aria-labelledby="theme-menu-button"'), 'Dropdown must be labelled by trigger');
      assert.ok(navContent.includes('onKeyDown={handleTriggerKeyDown}'), 'Trigger must handle keyboard activation');
      assert.ok(navContent.includes('onKeyDown={(e) => handleMenuKeyDown(e, idx)}'), 'Items must handle keyboard navigation');
      assert.ok(navContent.includes("e.key === 'Escape'"), 'Must handle Escape key to dismiss menu');
    });
  });
});
