import { AdditionalCost, FinancialCalculationResult, QuoteExecution, QuoteItem } from '../types';

export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export interface CalculationInput {
  items: QuoteItem[];
  additionalCosts: AdditionalCost[];
  execution: QuoteExecution;
  commercialSurcharge?: number;
  discountType?: 'FIXED' | 'PERCENT';
  discountValue?: number;
  manualNegotiatedPrice?: number | null;
}

export function calculateQuoteFinancials(input: CalculationInput): FinancialCalculationResult {
  const {
    items = [],
    additionalCosts = [],
    execution = { internalCost: 0, chargedPrice: 0, title: '', description: '', showDescriptionInClientPdf: true },
    commercialSurcharge = 0,
    discountType = 'FIXED',
    discountValue = 0,
    manualNegotiatedPrice = null,
  } = input;

  // 1. Total items count
  const totalItemsCount = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  // 2. Products total cost & total sale
  const productsTotalCost = roundToTwoDecimals(
    items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const unitCost = Number(item.unitCost) || 0;
      return acc + qty * unitCost;
    }, 0)
  );

  const productsTotalSale = roundToTwoDecimals(
    items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const unitSale = Number(item.unitSale) || 0;
      return acc + qty * unitSale;
    }, 0)
  );

  // 3. Additional costs
  const additionalCostsTotal = roundToTwoDecimals(
    additionalCosts.reduce((acc, cost) => acc + (Number(cost.cost) || 0), 0)
  );

  // 4. Execution costs & price
  const internalExecutionCost = roundToTwoDecimals(Number(execution.internalCost) || 0);
  const chargedExecutionPrice = roundToTwoDecimals(Number(execution.chargedPrice) || 0);

  // 5. Commercial surcharge
  const safeSurcharge = roundToTwoDecimals(Number(commercialSurcharge) || 0);

  // 6. Discount calculation
  let discountAmount = 0;
  const rawDiscount = Number(discountValue) || 0;
  if (discountType === 'PERCENT') {
    const baseSaleForDiscount = productsTotalSale + chargedExecutionPrice + safeSurcharge;
    discountAmount = roundToTwoDecimals((baseSaleForDiscount * rawDiscount) / 100);
  } else {
    discountAmount = roundToTwoDecimals(rawDiscount);
  }

  // 7. CUSTO GERAL = Custo dos produtos + custos adicionais + custo interno da execução
  const generalCost = roundToTwoDecimals(
    productsTotalCost + additionalCostsTotal + internalExecutionCost
  );

  // 8. VENDA CALCULADA = Venda dos produtos + valor cobrado pela execução + acréscimos comerciais - descontos comerciais
  const calculatedSale = roundToTwoDecimals(
    Math.max(0, productsTotalSale + chargedExecutionPrice + safeSurcharge - discountAmount)
  );

  // 9. VALOR FINAL NEGOCIADO
  const isManualPriceActive = manualNegotiatedPrice !== null && manualNegotiatedPrice !== undefined;
  const finalNegotiatedPrice = isManualPriceActive
    ? roundToTwoDecimals(Number(manualNegotiatedPrice) || 0)
    : calculatedSale;

  // 10. LUCRO BRUTO ESTIMADO = Valor final negociado - Custo geral
  const estimatedGrossProfit = roundToTwoDecimals(finalNegotiatedPrice - generalCost);

  // 11. MARGEM BRUTA PERCENTUAL = (Lucro bruto / Valor final negociado) * 100 (se valor final > 0)
  let grossMarginPercent: number | null = null;
  if (finalNegotiatedPrice > 0) {
    grossMarginPercent = roundToTwoDecimals((estimatedGrossProfit / finalNegotiatedPrice) * 100);
  }

  const differenceFromCalculated = roundToTwoDecimals(finalNegotiatedPrice - calculatedSale);

  return {
    totalItemsCount,
    productsTotalCost,
    productsTotalSale,
    additionalCostsTotal,
    internalExecutionCost,
    chargedExecutionPrice,
    commercialSurcharge: safeSurcharge,
    discountAmount,
    generalCost,
    calculatedSale,
    isManualPriceActive,
    finalNegotiatedPrice,
    estimatedGrossProfit,
    grossMarginPercent,
    differenceFromCalculated,
  };
}

export function formatCurrencyBRL(value: number): string {
  const safeValue = isNaN(value) ? 0 : value;
  return safeValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyBRL(input: string): number {
  if (!input) return 0;
  // Clean R$, dots and spaces, replace comma with dot
  const clean = input
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed);
}

export function formatDateBR(dateInput: string | Date): string {
  if (!dateInput) return '';
  try {
    // If string like YYYY-MM-DD
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-');
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  } catch {
    return String(dateInput);
  }
}

export function formatDateTimeBR(dateInput: string | Date): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateInput);
  }
}
