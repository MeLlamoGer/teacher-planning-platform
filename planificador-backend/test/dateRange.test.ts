import assert from 'node:assert/strict';
import test from 'node:test';
import { assertDateRange, parseDateOnly, rangesOverlap } from '../src/lib/dateRange';

test('parseDateOnly normalizes dates to midnight UTC', () => {
  const parsed = parseDateOnly('2026-09-18');
  assert.equal(parsed.toISOString(), '2026-09-18T00:00:00.000Z');
});

test('assertDateRange rejects an end before the start', () => {
  assert.throws(
    () => assertDateRange(parseDateOnly('2026-09-19'), parseDateOnly('2026-09-18')),
    /fecha de fin/i
  );
});

test('rangesOverlap treats touching inclusive date windows as overlapping', () => {
  assert.equal(
    rangesOverlap(
      parseDateOnly('2026-09-10'),
      parseDateOnly('2026-09-15'),
      parseDateOnly('2026-09-15'),
      parseDateOnly('2026-09-20')
    ),
    true
  );
});

test('rangesOverlap accepts separated date windows', () => {
  assert.equal(
    rangesOverlap(
      parseDateOnly('2026-09-10'),
      parseDateOnly('2026-09-14'),
      parseDateOnly('2026-09-15'),
      parseDateOnly('2026-09-20')
    ),
    false
  );
});
