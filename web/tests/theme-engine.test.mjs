import { test, describe, it } from 'node:test';
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
  it('should declare correct brand metadata and Restorative Juniper primary tokens', () => {
    assert.equal(BRAND.name.toUpperCase(), 'VRITTA');
    assert.equal(BRAND.themeColor, '#0F766E'); // Verdigris 700
    assert.equal(BRAND.colors.primary[600], '#0f766e');
    assert.equal(BRAND.colors.primary[700], '#115e59');
    assert.equal(BRAND.colors.primary[50], '#f0fdfa');
    assert.equal(BRAND.colors.accent.juniper, '#0f766e');
  });

  it('should guarantee WCAG 2.2 contrast ratios for all critical text and brand pairs', () => {
    // 1. Light mode primary text on white canvas (Target: >= 7.0 AAA)
    const lightMainContrast = getContrastRatio('#0F172A', '#FFFFFF');
    assert.ok(lightMainContrast >= 7.0, `Light main contrast ${lightMainContrast.toFixed(2)} should be >= 7.0 (AAA)`);

    // 2. Light mode brand Verdigris 700 on white canvas (Target: >= 4.5 AA)
    const brandOnWhiteContrast = getContrastRatio('#0F766E', '#FFFFFF');
    assert.ok(brandOnWhiteContrast >= 4.5, `Brand on white contrast ${brandOnWhiteContrast.toFixed(2)} should be >= 4.5 (AA)`);

    // 3. Dark mode primary text on dark canvas (Target: >= 7.0 AAA)
    const darkMainContrast = getContrastRatio('#F8FAFC', '#090D16');
    assert.ok(darkMainContrast >= 7.0, `Dark main contrast ${darkMainContrast.toFixed(2)} should be >= 7.0 (AAA)`);

    // 4. Dark mode resolved muted text (#8092a5) on dark canvas #090D16 (Target: >= 4.5 AA)
    const darkMutedOnCanvas = getContrastRatio('#8092a5', '#090D16');
    assert.ok(darkMutedOnCanvas >= 4.5, `Dark muted on canvas ${darkMutedOnCanvas.toFixed(2)} must be >= 4.5 (AA)`);
    assert.ok(darkMutedOnCanvas >= 6.0, `Dark muted on canvas should be >= 6.0:1 (actual: ${darkMutedOnCanvas.toFixed(2)})`);

    // 5. Dark mode resolved muted text (#8092a5) on dark surface #111827 (Target: >= 4.5 AA)
    const darkMutedOnSurface = getContrastRatio('#8092a5', '#111827');
    assert.ok(darkMutedOnSurface >= 4.5, `Dark muted on surface ${darkMutedOnSurface.toFixed(2)} must be >= 4.5 (AA)`);
    assert.ok(darkMutedOnSurface >= 5.5, `Dark muted on surface should be >= 5.5:1 (actual: ${darkMutedOnSurface.toFixed(2)})`);

    // 6. Failing legacy color #64748B verification (demonstrates why it was replaced)
    const failingLegacyContrast = getContrastRatio('#64748B', '#090D16');
    assert.ok(failingLegacyContrast < 4.5, 'Legacy #64748B fails AA on canvas, confirming necessity of #8092a5');
  });

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
    assert.ok(cssContent.includes('--color-bg-canvas: #f8fafc;'), 'Must define light canvas in :root');
    assert.ok(cssContent.includes('--color-bg-surface: #ffffff;'), 'Must define light card in :root');
    assert.ok(cssContent.includes('--color-accent-primary: #0f766e;'), 'Must define brand primary in :root');

    // Runtime tokens in .dark
    assert.ok(cssContent.includes('--color-bg-canvas: #090d16;'), 'Must define dark canvas in .dark');
    assert.ok(cssContent.includes('--color-bg-surface: #111827;'), 'Must define dark card in .dark');
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

  it('should verify TopNav.js provides accessible 3-state theme controls', () => {
    const navPath = path.join(projectRoot, 'src', 'components', 'ui', 'TopNav.js');
    const navContent = fs.readFileSync(navPath, 'utf8');

    assert.ok(navContent.includes('useTheme()'), 'TopNav must consume useTheme');
    assert.ok(navContent.includes('role="menuitemradio"'), 'Theme options must have role="menuitemradio"');
    assert.ok(navContent.includes('aria-checked={isSelected}'), 'Theme options must announce aria-checked');
    assert.ok(navContent.includes('aria-haspopup="menu"'), 'Theme toggle button must have aria-haspopup="menu"');
    assert.ok(navContent.includes('setTheme(id)'), 'Theme options must call setTheme');
  });
});
