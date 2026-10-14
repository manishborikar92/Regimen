import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OSHO_LIBRARY, OSHO_GROUPS } from '../src/lib/fixtures/osho-library.js';

describe('Osho Listening Library & Tracking Integrity', () => {
  it('should contain exactly 30 entries in canonical order', () => {
    assert.equal(OSHO_LIBRARY.length, 30, 'Library must contain exactly 30 titles');

    // Verify ordering 1 to 30
    OSHO_LIBRARY.forEach((item, idx) => {
      assert.equal(item.order, idx + 1, `Item at index ${idx} must have order ${idx + 1}`);
    });
  });

  it('should arrange entries into 6 thematic groups with Hindi first and English later', () => {
    assert.equal(OSHO_GROUPS.length, 6, 'Must define 6 groups');

    // Groups 1 to 5 are Hindi
    for (let i = 0; i < 5; i++) {
      assert.equal(OSHO_GROUPS[i].language, 'Hindi', `Group ${i + 1} must be Hindi`);
    }

    // Group 6 is English
    assert.equal(OSHO_GROUPS[5].language, 'English', 'Group 6 must be English');

    // Items 1-23 are Hindi, Items 24-30 are English
    const hindiItems = OSHO_LIBRARY.slice(0, 23);
    const englishItems = OSHO_LIBRARY.slice(23, 30);

    hindiItems.forEach(item => {
      assert.equal(item.language, 'Hindi', `${item.title} must be Hindi`);
    });

    englishItems.forEach(item => {
      assert.equal(item.language, 'English', `${item.title} must be English`);
    });
  });

  it('should preserve talk count uncertainty with null where counts differ across editions', () => {
    // Kranti Sutra (Item 9)
    const krantiSutra = OSHO_LIBRARY.find(i => i.order === 9);
    assert.equal(krantiSutra.talkCount, null, 'Kranti Sutra talk count must be null');
    assert.ok(krantiSutra.note.includes('No definitive count'), 'Must include explanatory note');

    // Sambhog Se Samadhi Ki Or (Item 18)
    const sambhog = OSHO_LIBRARY.find(i => i.order === 18);
    assert.equal(sambhog.talkCount, null, 'Sambhog Se Samadhi talk count must be null');
    assert.ok(sambhog.note.includes('seven talks') && sambhog.note.includes('16 audio entries'));

    // Amrit Varsha (Item 23)
    const amritVarsha = OSHO_LIBRARY.find(i => i.order === 23);
    assert.equal(amritVarsha.talkCount, null, 'Amrit Varsha talk count must be null');

    // Priests and Politicians (Item 30)
    const priests = OSHO_LIBRARY.find(i => i.order === 30);
    assert.equal(priests.talkCount, null, 'Priests & Politicians must be null (edited compilation)');
    assert.equal(priests.isYouTubeSearch, true);
    assert.ok(priests.url.includes('youtube.com/results?search_query='));
  });

  it('should verify verified talk counts match specifications', () => {
    // Main Mrityu Sikhata Hun (15 talks)
    assert.equal(OSHO_LIBRARY[0].talkCount, 15);

    // Maro He Jogi Maro (20 talks)
    assert.equal(OSHO_LIBRARY[2].talkCount, 20);

    // Jin Sutra (62 talks)
    assert.equal(OSHO_LIBRARY[3].talkCount, 62);

    // Krishna Smriti (22 entries)
    assert.equal(OSHO_LIBRARY[4].talkCount, 22);

    // Satyam Shivam Sundaram (30 talks)
    assert.equal(OSHO_LIBRARY[23].talkCount, 30);

    // Vigyan Bhairav Tantra / Book of Secrets (80 talks)
    assert.equal(OSHO_LIBRARY[24].talkCount, 80);
  });
});
