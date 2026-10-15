import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  return null;
}

const AUTHORITATIVE_PATH = 'M 68 132 C 44 132 40 100 68 84 C 92 70 108 130 132 116 C 160 100 156 68 132 68 C 108 68 92 128 68 132 Z';

describe('Phase 2: Authoritative Logo & Favicon Asset Pipeline', () => {

  describe('Authoritative Source of Truth & Vector Integrity', () => {
    it('should verify Logo.js contains authoritative Guiding Sutra coordinates and theme variables', () => {
      const logoJsPath = path.join(projectRoot, 'src', 'components', 'ui', 'Logo.js');
      const content = fs.readFileSync(logoJsPath, 'utf8');

      assert.ok(content.includes('viewBox="0 0 200 200"'), 'Logo.js must use 200x200 viewBox matching authoritative source');
      assert.ok(content.includes(AUTHORITATIVE_PATH), 'Logo.js must match exact Guiding Sutra continuous loop coordinates');
      assert.ok(content.includes('strokeWidth="13"'), 'Logo.js stroke-width must be 13');
      assert.ok(content.includes('cx="100"') && content.includes('cy="100"') && content.includes('r="8"'), 'Logo.js must include center balance dot at (100, 100, r=8)');
      assert.ok(content.includes('--color-brand-primary') || content.includes('#0F766E'), 'Logo.js must reference Restorative Juniper primary brand color');
    });

    it('should verify public/logo.svg and app/icon0.svg match authoritative geometry and support dark mode', () => {
      const publicLogoPath = path.join(projectRoot, 'public', 'logo.svg');
      const icon0Path = path.join(projectRoot, 'src', 'app', 'icon0.svg');

      for (const svgPath of [publicLogoPath, icon0Path]) {
        const content = fs.readFileSync(svgPath, 'utf8');
        assert.ok(content.includes('viewBox="0 0 200 200"'), `${svgPath} must use 200x200 viewBox`);
        assert.ok(content.includes(AUTHORITATIVE_PATH), `${svgPath} must match exact Guiding Sutra coordinates`);
        assert.ok(content.includes('cx="100"') && content.includes('cy="100"') && content.includes('r="8"'), `${svgPath} must include center balance dot at (100, 100, r=8)`);
        assert.ok(content.includes('#0F766E'), `${svgPath} must reference Restorative Juniper #0F766E`);
        assert.ok(content.includes('#14B8A6'), `${svgPath} must include dark mode Luminous Teal #14B8A6`);
        assert.ok(content.includes('#D97706'), `${svgPath} must include Warm Amber #D97706`);
        assert.ok(content.includes('#F59E0B'), `${svgPath} must include dark mode Warm Gold #F59E0B`);
      }
    });
  });

  describe('Raster Assets & Pixel Dimensions', () => {
    it('should verify Apple touch icon dimensions are exactly 180x180 px', () => {
      const applePath = path.join(projectRoot, 'src', 'app', 'apple-icon.png');
      assert.ok(fs.existsSync(applePath), 'apple-icon.png must exist');
      const dim = getPngDimensions(applePath);
      assert.deepEqual(dim, { width: 180, height: 180 }, 'apple-icon.png must be 180x180 px');
    });

    it('should verify Next.js icon1.png dimensions are exactly 48x48 px', () => {
      const icon1Path = path.join(projectRoot, 'src', 'app', 'icon1.png');
      assert.ok(fs.existsSync(icon1Path), 'icon1.png must exist');
      const dim = getPngDimensions(icon1Path);
      assert.deepEqual(dim, { width: 48, height: 48 }, 'icon1.png must be 48x48 px');
    });

    it('should verify PWA web-app-manifest-192x192.png and 512x512.png dimensions', () => {
      const pwa192Path = path.join(projectRoot, 'public', 'web-app-manifest-192x192.png');
      const pwa512Path = path.join(projectRoot, 'public', 'web-app-manifest-512x512.png');

      assert.ok(fs.existsSync(pwa192Path), '192x192 PNG must exist');
      assert.ok(fs.existsSync(pwa512Path), '512x512 PNG must exist');

      assert.deepEqual(getPngDimensions(pwa192Path), { width: 192, height: 192 });
      assert.deepEqual(getPngDimensions(pwa512Path), { width: 512, height: 512 });
    });

    it('should verify multi-resolution favicon.ico contains 16x16 and 32x32 entries', () => {
      const icoPath = path.join(projectRoot, 'src', 'app', 'favicon.ico');
      assert.ok(fs.existsSync(icoPath), 'favicon.ico must exist');

      const buf = fs.readFileSync(icoPath);
      assert.equal(buf.readUInt16LE(0), 0, 'ICO reserved word must be 0');
      assert.equal(buf.readUInt16LE(2), 1, 'ICO type must be 1 (icon)');
      const count = buf.readUInt16LE(4);
      assert.equal(count, 2, 'ICO must contain 2 sub-images');

      const entry0W = buf.readUInt8(6) || 256;
      const entry0H = buf.readUInt8(7) || 256;
      const entry1W = buf.readUInt8(22) || 256;
      const entry1H = buf.readUInt8(23) || 256;

      assert.equal(entry0W, 16, 'First ICO entry must be 16px wide');
      assert.equal(entry0H, 16, 'First ICO entry must be 16px high');
      assert.equal(entry1W, 32, 'Second ICO entry must be 32px wide');
      assert.equal(entry1H, 32, 'Second ICO entry must be 32px high');
    });
  });

  describe('Manifest & App Metadata Resolution', () => {
    it('should verify manifest.json declares VRITTA branding and valid icon references', () => {
      const manifestPath = path.join(projectRoot, 'src', 'app', 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      assert.ok(manifest.name.startsWith('VRITTA'), 'Manifest name must start with VRITTA');
      assert.equal(manifest.short_name, 'VRITTA');
      assert.equal(manifest.theme_color, '#0F766E');
      assert.equal(manifest.background_color, '#F8FAFC');

      // Verify every declared icon exists
      for (const icon of manifest.icons) {
        const relPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
        const inPublic = path.join(projectRoot, 'public', relPath);
        const inApp = path.join(projectRoot, 'src', 'app', relPath);
        assert.ok(
          fs.existsSync(inPublic) || fs.existsSync(inApp),
          `Manifest icon ${icon.src} must exist on disk`
        );
      }
    });

    it('should verify layout.js metadata configures valid non-conflicting icon declarations', () => {
      const layoutPath = path.join(projectRoot, 'src', 'app', 'layout.js');
      const content = fs.readFileSync(layoutPath, 'utf8');

      assert.ok(content.includes('apple-icon.png'), 'layout.js must reference apple-icon.png for iOS (PNG format required)');
      assert.ok(content.includes('favicon.ico'), 'layout.js must reference favicon.ico');
      assert.ok(content.includes('icon0.svg'), 'layout.js must reference vector icon0.svg');
      assert.ok(content.includes('/manifest.json'), 'layout.js must reference /manifest.json');
    });
  });
});
