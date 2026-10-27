import test from 'node:test';
import assert from 'node:assert/strict';
import { getCategoryPrefix } from '../services/storage';

test('getCategoryPrefix extracts first two normalized uppercase letters', () => {
  assert.equal(getCategoryPrefix('Tortas e Baterias'), 'TO');
  assert.equal(getCategoryPrefix('Fumaças Coloridas'), 'FU');
  assert.equal(getCategoryPrefix('Gerbs'), 'GE');
  assert.equal(getCategoryPrefix('Morteiros e Bombas'), 'MO');
  assert.equal(getCategoryPrefix('Fogos Indoor'), 'FO');
  assert.equal(getCategoryPrefix('Áudio e Efeitos'), 'AU');
  assert.equal(getCategoryPrefix('Éden Show'), 'ED');
  assert.equal(getCategoryPrefix('Íris Pirotecnia'), 'IR');
  assert.equal(getCategoryPrefix('Órbita'), 'OR');
  assert.equal(getCategoryPrefix('Único'), 'UN');
  assert.equal(getCategoryPrefix(''), 'PR');
  assert.equal(getCategoryPrefix(undefined), 'PR');
});

test('Sequential product code format conforms to XX-0001 pattern', () => {
  const prefix = getCategoryPrefix('Tortas e Baterias');
  const code1 = `${prefix}-${String(1).padStart(4, '0')}`;
  const code2 = `${prefix}-${String(2).padStart(4, '0')}`;
  assert.equal(code1, 'TO-0001');
  assert.equal(code2, 'TO-0002');

  const fumacasPrefix = getCategoryPrefix('Fumaças Coloridas');
  const fumacas1 = `${fumacasPrefix}-${String(1).padStart(4, '0')}`;
  assert.equal(fumacas1, 'FU-0001');
});
