import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeColorName } from '../services/storage';

test('normalizeColorName handles case and accents', () => {
  assert.equal(normalizeColorName('Vermelho'), 'vermelho');
  assert.equal(normalizeColorName('VERMELHO'), 'vermelho');
  assert.equal(normalizeColorName('vermelho'), 'vermelho');
  assert.equal(normalizeColorName('Azul-Celeste'), 'azul-celeste');
  assert.equal(normalizeColorName('Fumaça'), 'fumaca');
  assert.equal(normalizeColorName('Púrpura'), 'purpura');
  assert.equal(normalizeColorName('  Dourado  '), 'dourado');
});

test('Color duplicate detection works with case and accent variations', () => {
  const existingColors = ['Vermelho', 'Verde', 'Azul', 'Púrpura'];
  const isDuplicate = (newColor: string) => {
    const norm = normalizeColorName(newColor);
    return existingColors.some((c) => normalizeColorName(c) === norm);
  };

  assert.equal(isDuplicate('vermelho'), true);
  assert.equal(isDuplicate('VERMELHO'), true);
  assert.equal(isDuplicate('Purpura'), true);
  assert.equal(isDuplicate('PÚRPURA'), true);
  assert.equal(isDuplicate('Amarelo'), false);
  assert.equal(isDuplicate('Dourado'), false);
});

test('Product filtering by color matches multiple and single colors', () => {
  const sampleProducts = [
    { id: '1', name: 'Torta 1', category: 'Tortas e Baterias', colors: ['Vermelho', 'Verde', 'Azul'] },
    { id: '2', name: 'Torta 2', category: 'Tortas e Baterias', colors: ['Dourado', 'Prata'] },
    { id: '3', name: 'Morteiro 1', category: 'Morteiros e Bombas', colors: ['Azul'] },
    { id: '4', name: 'Fogos sem cor', category: 'Cascatas', colors: [] },
  ];

  // Filter: Todas as Cores (ALL)
  const allFiltered = sampleProducts.filter(() => true);
  assert.equal(allFiltered.length, 4);

  // Filter: Azul
  const azulFiltered = sampleProducts.filter((p) => p.colors.includes('Azul'));
  assert.equal(azulFiltered.length, 2);
  assert.deepEqual(azulFiltered.map((p) => p.id), ['1', '3']);

  // Filter: Vermelho + Tortas e Baterias
  const redTortas = sampleProducts.filter(
    (p) => p.category === 'Tortas e Baterias' && p.colors.includes('Vermelho')
  );
  assert.equal(redTortas.length, 1);
  assert.equal(redTortas[0].id, '1');

  // Filter: Prata
  const prataFiltered = sampleProducts.filter((p) => p.colors.includes('Prata'));
  assert.equal(prataFiltered.length, 1);
  assert.equal(prataFiltered[0].id, '2');
});
