import test from 'node:test';
import assert from 'node:assert/strict';
import { generateClientQuotePDF, generateInternalQuotePDF } from './pdfGenerator';
import { INITIAL_COMPANY_SETTINGS, INITIAL_QUOTES } from '../data/seedData';

test('generateInternalQuotePDF creates valid filename and doc', () => {
  const quote = INITIAL_QUOTES[0];
  const result = generateInternalQuotePDF(quote, INITIAL_COMPANY_SETTINGS);

  assert.ok(result.doc);
  assert.match(result.filename, /BIGART_Orcamento_ORC-0001_.*_INTERNO\.pdf/);
});

test('generateClientQuotePDF creates valid filename and doc with single total price', () => {
  const quote = INITIAL_QUOTES[0];
  const result = generateClientQuotePDF(quote, INITIAL_COMPANY_SETTINGS);

  assert.ok(result.doc);
  assert.match(result.filename, /BIGART_Orcamento_ORC-0001_.*_CLIENTE\.pdf/);
});
