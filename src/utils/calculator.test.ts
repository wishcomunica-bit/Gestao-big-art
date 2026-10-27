import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQuoteFinancials,
  formatCurrencyBRL,
  formatDateBR,
  parseCurrencyBRL,
} from './calculator';
import { AdditionalCost, QuoteExecution, QuoteItem } from '../types';

test('Section 17 reference scenario - automatic calculation', () => {
  const items: QuoteItem[] = [
    {
      id: 'item-1',
      productId: 'p1',
      productCode: 'BAT-01',
      productName: 'Torta Show 100 Tiros',
      description: 'Efeitos coloridos',
      quantity: 2,
      unitCost: 600, // total cost 1200
      unitSale: 900, // total sale 1800
      totalCost: 1200,
      totalSale: 1800,
    },
  ];

  const additionalCosts: AdditionalCost[] = [
    { id: 'c1', description: 'Transporte', cost: 150 },
    { id: 'c2', description: 'Alimentação', cost: 80 },
  ];

  const execution: QuoteExecution = {
    title: 'Execução de Show Pirotécnico',
    description: 'Montagem e disparo',
    internalCost: 200,
    chargedPrice: 500,
    showDescriptionInClientPdf: true,
  };

  const result = calculateQuoteFinancials({
    items,
    additionalCosts,
    execution,
    commercialSurcharge: 0,
    discountValue: 0,
    manualNegotiatedPrice: null,
  });

  assert.equal(result.productsTotalCost, 1200.00);
  assert.equal(result.productsTotalSale, 1800.00);
  assert.equal(result.additionalCostsTotal, 230.00);
  assert.equal(result.internalExecutionCost, 200.00);
  assert.equal(result.chargedExecutionPrice, 500.00);
  assert.equal(result.generalCost, 1630.00);
  assert.equal(result.calculatedSale, 2300.00);
  assert.equal(result.finalNegotiatedPrice, 2300.00);
  assert.equal(result.estimatedGrossProfit, 670.00);
  assert.equal(result.isManualPriceActive, false);
});

test('Section 17 reference scenario - manual negotiated price of R$ 2.500,00', () => {
  const items: QuoteItem[] = [
    {
      id: 'item-1',
      productId: 'p1',
      productCode: 'BAT-01',
      productName: 'Torta Show 100 Tiros',
      description: 'Efeitos coloridos',
      quantity: 2,
      unitCost: 600,
      unitSale: 900,
      totalCost: 1200,
      totalSale: 1800,
    },
  ];

  const additionalCosts: AdditionalCost[] = [
    { id: 'c1', description: 'Transporte', cost: 150 },
    { id: 'c2', description: 'Alimentação', cost: 80 },
  ];

  const execution: QuoteExecution = {
    title: 'Execução de Show Pirotécnico',
    description: 'Montagem e disparo',
    internalCost: 200,
    chargedPrice: 500,
    showDescriptionInClientPdf: true,
  };

  const result = calculateQuoteFinancials({
    items,
    additionalCosts,
    execution,
    commercialSurcharge: 0,
    discountValue: 0,
    manualNegotiatedPrice: 2500,
  });

  assert.equal(result.generalCost, 1630.00);
  assert.equal(result.calculatedSale, 2300.00);
  assert.equal(result.finalNegotiatedPrice, 2500.00);
  assert.equal(result.estimatedGrossProfit, 870.00);
  assert.equal(result.grossMarginPercent, 34.8);
  assert.equal(result.isManualPriceActive, true);
  assert.equal(result.differenceFromCalculated, 200.00);
});

test('Zero final price does not throw and returns null margin', () => {
  const result = calculateQuoteFinancials({
    items: [],
    additionalCosts: [],
    execution: { title: '', description: '', internalCost: 0, chargedPrice: 0, showDescriptionInClientPdf: true },
    manualNegotiatedPrice: 0,
  });

  assert.equal(result.finalNegotiatedPrice, 0);
  assert.equal(result.grossMarginPercent, null);
});

test('Currency formatting in Brazilian Real', () => {
  const formatted = formatCurrencyBRL(1250);
  // Match R$ 1.250,00 (accounting for non-breaking space \u00a0 or regular space)
  assert.match(formatted, /R\$\s?1\.250,00/);
});

test('Date formatting in DD/MM/AAAA', () => {
  const formatted = formatDateBR('2026-10-26');
  assert.equal(formatted, '26/10/2026');
});
