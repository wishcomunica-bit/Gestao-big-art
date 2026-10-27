export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  videoUrl?: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  unit: string;
  minStockQuantity: number;
  isActive: boolean;
  images: string[]; // up to 3 photos
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  date: string;
}

export interface AdditionalCost {
  id: string;
  description: string;
  cost: number;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  photoUrl?: string;
  quantity: number;
  unitCost: number;
  unitSale: number;
  totalCost: number;
  totalSale: number;
}

export interface QuoteExecution {
  title: string;
  description: string;
  internalCost: number;
  chargedPrice: number;
  showDescriptionInClientPdf: boolean;
}

export interface ClientInfo {
  name: string;
  contactPerson: string;
  cpfCnpj?: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
}

export interface EventInfo {
  name: string;
  city: string;
  date: string;
  time: string;
  location: string;
  executionTime: string;
  notes?: string;
}

export type QuoteStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Cancelado';

export interface Quote {
  id: string;
  number: string;
  sequentialNumber: number;
  name: string;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  updatedAt: string;
  client: ClientInfo;
  event: EventInfo;
  items: QuoteItem[];
  additionalCosts: AdditionalCost[];
  commercialSurcharge: number;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number;
  execution: QuoteExecution;
  manualNegotiatedPrice: number | null; // null if automatic
  notes: string;
  terms: string;
  originalQuoteId?: string;
  version?: number;
  archived?: boolean;
}

export interface FinancialCalculationResult {
  totalItemsCount: number;
  productsTotalCost: number;
  productsTotalSale: number;
  additionalCostsTotal: number;
  internalExecutionCost: number;
  chargedExecutionPrice: number;
  commercialSurcharge: number;
  discountAmount: number;
  generalCost: number;
  calculatedSale: number;
  isManualPriceActive: boolean;
  finalNegotiatedPrice: number;
  estimatedGrossProfit: number;
  grossMarginPercent: number | null;
  differenceFromCalculated: number;
}

export interface CompanySettings {
  commercialName: string;
  logoUrl: string;
  address: string;
  phonePrimary: string;
  phoneSecondary: string;
  instagram: string;
  instagramUrl: string;
  institutionalDescription: string;
  defaultNotes: string;
  defaultTerms: string;
  defaultExecutionDescription: string;
}
