import { CompanySettings, MovementType, Product, Quote, StockMovement } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COLORS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
} from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'bigart_products_v1',
  CATEGORIES: 'bigart_categories_v1',
  COLORS: 'bigart_colors_v1',
  MOVEMENTS: 'bigart_movements_v1',
  QUOTES: 'bigart_quotes_v1',
  SETTINGS: 'bigart_settings_v1',
  AUTH: 'bigart_auth_v1',
};

// Dispatch custom event when storage changes so components can react
function notifyChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bigart_storage_updated', { detail: { key } }));
  }
}

// ---------------- PRODUCTS ----------------

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed: Product[] = JSON.parse(raw);
    return parsed.map((p) => ({
      ...p,
      colors: Array.isArray(p.colors) ? p.colors : [],
    }));
  } catch (e) {
    console.error('Error reading products from storage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveProduct(product: Partial<Product> & { name: string; code: string }): Product {
  const products = getStoredProducts();
  const now = new Date().toISOString();

  let savedProduct: Product;

  if (product.id) {
    // Edit existing
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      savedProduct = {
        ...products[index],
        ...product,
        colors: Array.isArray(product.colors)
          ? product.colors
          : products[index].colors || [],
        updatedAt: now,
      } as Product;
      products[index] = savedProduct;
    } else {
      savedProduct = {
        ...product,
        id: product.id,
        colors: Array.isArray(product.colors) ? product.colors : [],
        createdAt: now,
        updatedAt: now,
      } as Product;
      products.push(savedProduct);
    }
  } else {
    // New product
    savedProduct = {
      id: 'prod-' + Date.now(),
      code: product.code.trim().toUpperCase(),
      name: product.name.trim(),
      category: product.category || 'Geral',
      description: product.description || '',
      videoUrl: product.videoUrl?.trim() || '',
      colors: Array.isArray(product.colors) ? product.colors : [],
      costPrice: Number(product.costPrice) || 0,
      salePrice: Number(product.salePrice) || 0,
      stockQuantity: Number(product.stockQuantity) || 0,
      unit: product.unit || 'un',
      minStockQuantity: Number(product.minStockQuantity) || 0,
      isActive: product.isActive ?? true,
      images: product.images || [],
      createdAt: now,
      updatedAt: now,
    };
    products.push(savedProduct);

    // Initial movement record
    if (savedProduct.stockQuantity > 0) {
      recordMovement({
        productId: savedProduct.id,
        productCode: savedProduct.code,
        productName: savedProduct.name,
        type: 'ENTRADA',
        quantity: savedProduct.stockQuantity,
        previousStock: 0,
        newStock: savedProduct.stockQuantity,
        reason: 'Cadastro inicial de produto com saldo em estoque',
      });
    }
  }

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyChange(STORAGE_KEYS.PRODUCTS);
  return savedProduct;
}

export function deleteProduct(productId: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== productId);
  if (filtered.length !== products.length) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    notifyChange(STORAGE_KEYS.PRODUCTS);
    return true;
  }
  return false;
}

export function getCategoryPrefix(categoryName?: string): string {
  if (!categoryName) return 'PR';
  // Normalize accents (e.g. "Fumaças" -> "Fumacas", "Chá" -> "Cha")
  const normalized = categoryName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  // Extract alphanumeric letters only
  const lettersOnly = normalized.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length >= 2) {
    return lettersOnly.slice(0, 2).toUpperCase();
  } else if (lettersOnly.length === 1) {
    return (lettersOnly + 'X').toUpperCase();
  }
  return 'PR';
}

export function generateProductCode(category?: string): string {
  const products = getStoredProducts();
  const prefix = getCategoryPrefix(category);

  // Look for existing products with code matching prefix + '-' + digits
  const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  let maxSeq = 0;

  for (const p of products) {
    const code = (p.code || '').trim();
    const match = code.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}-${String(nextSeq).padStart(4, '0')}`;

  // Ensure absolute uniqueness across all products (including custom entered codes)
  while (products.some((p) => p.code.toUpperCase() === candidate)) {
    nextSeq++;
    candidate = `${prefix}-${String(nextSeq).padStart(4, '0')}`;
  }

  return candidate;
}

// ---------------- CATEGORIES ----------------

export function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CATEGORIES;
  }
}

export function saveCategory(categoryName: string): string[] {
  const clean = categoryName.trim();
  if (!clean) return getStoredCategories();
  const categories = getStoredCategories();
  if (!categories.includes(clean)) {
    categories.push(clean);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    notifyChange(STORAGE_KEYS.CATEGORIES);
  }
  return categories;
}

// ---------------- COLORS ----------------

export function normalizeColorName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getStoredColors(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(INITIAL_COLORS));
      return INITIAL_COLORS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COLORS;
  }
}

export function saveColor(colorName: string): { success: boolean; colors: string[]; error?: string } {
  const clean = colorName.trim();
  if (!clean) {
    return { success: false, colors: getStoredColors(), error: 'O nome da cor não pode ser vazio.' };
  }

  const colors = getStoredColors();
  const normalizedClean = normalizeColorName(clean);

  // Check case and accent-insensitive uniqueness
  const exists = colors.some((c) => normalizeColorName(c) === normalizedClean);
  if (exists) {
    return {
      success: false,
      colors,
      error: `A cor "${clean}" já está cadastrada no sistema.`,
    };
  }

  colors.push(clean);
  localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(colors));
  notifyChange(STORAGE_KEYS.COLORS);

  return { success: true, colors };
}

export function renameColor(
  oldName: string,
  newName: string
): { success: boolean; colors: string[]; error?: string } {
  const cleanNew = newName.trim();
  if (!cleanNew) {
    return { success: false, colors: getStoredColors(), error: 'O novo nome da cor não pode ser vazio.' };
  }

  const colors = getStoredColors();
  const normOld = normalizeColorName(oldName);
  const normNew = normalizeColorName(cleanNew);

  if (normOld !== normNew && colors.some((c) => normalizeColorName(c) === normNew)) {
    return {
      success: false,
      colors,
      error: `Já existe uma cor cadastrada com o nome "${cleanNew}".`,
    };
  }

  const colorIndex = colors.findIndex((c) => normalizeColorName(c) === normOld);
  if (colorIndex >= 0) {
    colors[colorIndex] = cleanNew;
  } else {
    colors.push(cleanNew);
  }

  localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(colors));
  notifyChange(STORAGE_KEYS.COLORS);

  // Cascade rename to all linked products
  const products = getStoredProducts();
  let updatedAny = false;
  const updatedProducts = products.map((p) => {
    if (p.colors && p.colors.some((c) => normalizeColorName(c) === normOld)) {
      updatedAny = true;
      const newColors = Array.from(
        new Set(
          p.colors.map((c) => (normalizeColorName(c) === normOld ? cleanNew : c))
        )
      );
      return { ...p, colors: newColors };
    }
    return p;
  });

  if (updatedAny) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    notifyChange(STORAGE_KEYS.PRODUCTS);
  }

  return { success: true, colors };
}

export function deleteColor(colorName: string): { success: boolean; colors: string[] } {
  const colors = getStoredColors();
  const normTarget = normalizeColorName(colorName);

  const filteredColors = colors.filter((c) => normalizeColorName(c) !== normTarget);
  localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(filteredColors));
  notifyChange(STORAGE_KEYS.COLORS);

  // Unlink color from all products without deleting products
  const products = getStoredProducts();
  let updatedAny = false;
  const updatedProducts = products.map((p) => {
    if (p.colors && p.colors.some((c) => normalizeColorName(c) === normTarget)) {
      updatedAny = true;
      return {
        ...p,
        colors: p.colors.filter((c) => normalizeColorName(c) !== normTarget),
      };
    }
    return p;
  });

  if (updatedAny) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    notifyChange(STORAGE_KEYS.PRODUCTS);
  }

  return { success: true, colors: filteredColors };
}

export function getProductsCountByColor(colorName: string): number {
  const normTarget = normalizeColorName(colorName);
  const products = getStoredProducts();
  return products.filter((p) =>
    (p.colors || []).some((c) => normalizeColorName(c) === normTarget)
  ).length;
}

// ---------------- STOCK MOVEMENTS ----------------

export function getStoredMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MOVEMENTS;
  }
}

export function recordMovement(movement: Omit<StockMovement, 'id' | 'date'>): StockMovement {
  const movements = getStoredMovements();
  const newRecord: StockMovement = {
    ...movement,
    id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    date: new Date().toISOString(),
  };
  movements.unshift(newRecord);
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  notifyChange(STORAGE_KEYS.MOVEMENTS);
  return newRecord;
}

export function updateProductStock(
  productId: string,
  type: MovementType,
  quantityChange: number,
  reason: string
): { success: boolean; product?: Product; error?: string } {
  const products = getStoredProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return { success: false, error: 'Produto não encontrado' };
  }

  const previousStock = Number(product.stockQuantity) || 0;
  let newStock = previousStock;
  const change = Math.abs(Number(quantityChange) || 0);

  if (type === 'ENTRADA') {
    newStock = previousStock + change;
  } else if (type === 'SAIDA') {
    if (change > previousStock) {
      return { success: false, error: 'Quantidade de saída maior que o estoque atual disponível' };
    }
    newStock = previousStock - change;
  } else if (type === 'AJUSTE') {
    newStock = Number(quantityChange);
  }

  product.stockQuantity = newStock;
  product.updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyChange(STORAGE_KEYS.PRODUCTS);

  recordMovement({
    productId: product.id,
    productCode: product.code,
    productName: product.name,
    type,
    quantity: type === 'AJUSTE' ? Math.abs(newStock - previousStock) : change,
    previousStock,
    newStock,
    reason: reason || `Movimentação de ${type.toLowerCase()}`,
  });

  return { success: true, product };
}

// ---------------- QUOTES ----------------

export function getStoredQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_QUOTES;
  }
}

export function getQuoteById(id: string): Quote | undefined {
  const quotes = getStoredQuotes();
  return quotes.find((q) => q.id === id);
}

export function getNextQuoteNumber(): { number: string; sequentialNumber: number } {
  const quotes = getStoredQuotes();
  let maxSeq = 0;
  for (const q of quotes) {
    if (q.sequentialNumber && q.sequentialNumber > maxSeq) {
      maxSeq = q.sequentialNumber;
    } else {
      // Try parsing from string ORC-0001
      const match = q.number?.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (val > maxSeq) maxSeq = val;
      }
    }
  }
  const nextSeq = maxSeq + 1;
  const formattedNumber = `ORC-${String(nextSeq).padStart(4, '0')}`;
  return { number: formattedNumber, sequentialNumber: nextSeq };
}

export function saveQuote(quoteData: Partial<Quote>): Quote {
  const quotes = getStoredQuotes();
  const now = new Date().toISOString();

  let saved: Quote;

  if (quoteData.id && quotes.some((q) => q.id === quoteData.id)) {
    // Update existing quote, preserve original number and sequentialNumber
    const idx = quotes.findIndex((q) => q.id === quoteData.id);
    const existing = quotes[idx];
    saved = {
      ...existing,
      ...quoteData,
      number: existing.number, // Invariable rule: keep original number
      sequentialNumber: existing.sequentialNumber,
      updatedAt: now,
    } as Quote;
    quotes[idx] = saved;
  } else {
    // Brand new quote
    const nextSeqInfo = getNextQuoteNumber();
    saved = {
      id: quoteData.id || 'quote-' + Date.now(),
      number: quoteData.number || nextSeqInfo.number,
      sequentialNumber: quoteData.sequentialNumber || nextSeqInfo.sequentialNumber,
      name: quoteData.name || `Orçamento ${nextSeqInfo.number}`,
      status: quoteData.status || 'Rascunho',
      createdAt: quoteData.createdAt || new Date().toISOString().split('T')[0],
      validUntil: quoteData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      updatedAt: now,
      client: quoteData.client || { name: '', contactPerson: '', phone: '', email: '' },
      event: quoteData.event || { name: '', city: '', date: '', time: '', location: '', executionTime: '' },
      items: quoteData.items || [],
      additionalCosts: quoteData.additionalCosts || [],
      commercialSurcharge: Number(quoteData.commercialSurcharge) || 0,
      discountType: quoteData.discountType || 'FIXED',
      discountValue: Number(quoteData.discountValue) || 0,
      execution: quoteData.execution || {
        title: 'Execução de Show Pirotécnico',
        description: '',
        internalCost: 0,
        chargedPrice: 0,
        showDescriptionInClientPdf: true,
      },
      manualNegotiatedPrice: quoteData.manualNegotiatedPrice !== undefined ? quoteData.manualNegotiatedPrice : null,
      notes: quoteData.notes || '',
      terms: quoteData.terms || '',
      originalQuoteId: quoteData.originalQuoteId,
      version: quoteData.version || 1,
      archived: quoteData.archived || false,
    };
    quotes.unshift(saved);
  }

  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  notifyChange(STORAGE_KEYS.QUOTES);
  return saved;
}

export function duplicateQuote(sourceId: string): Quote | null {
  const source = getQuoteById(sourceId);
  if (!source) return null;

  const nextSeq = getNextQuoteNumber();
  const copy: Quote = {
    ...JSON.parse(JSON.stringify(source)),
    id: 'quote-' + Date.now(),
    number: nextSeq.number,
    sequentialNumber: nextSeq.sequentialNumber,
    name: `${source.name} (Cópia)`,
    status: 'Rascunho',
    createdAt: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    originalQuoteId: source.id,
    version: (source.version || 1) + 1,
  };

  const quotes = getStoredQuotes();
  quotes.unshift(copy);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  notifyChange(STORAGE_KEYS.QUOTES);
  return copy;
}

export function deleteQuote(quoteId: string): boolean {
  const quotes = getStoredQuotes();
  const filtered = quotes.filter((q) => q.id !== quoteId);
  if (filtered.length !== quotes.length) {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(filtered));
    notifyChange(STORAGE_KEYS.QUOTES);
    return true;
  }
  return false;
}

// ---------------- SETTINGS ----------------

export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_COMPANY_SETTINGS));
      return INITIAL_COMPANY_SETTINGS;
    }
    return { ...INITIAL_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return INITIAL_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: Partial<CompanySettings>): CompanySettings {
  const current = getCompanySettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  notifyChange(STORAGE_KEYS.SETTINGS);
  return updated;
}

// ---------------- AUTH ----------------

export interface AuthSession {
  isAuthenticated: boolean;
  email: string;
  name: string;
  role: string;
}

export function getAuthSession(): AuthSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) {
      // Default to logged in as administrator for immediate productive use
      const defaultAuth: AuthSession = {
        isAuthenticated: true,
        email: 'admin@bigartfogos.com.br',
        name: 'Administrador Big Art',
        role: 'Diretor / Blaster Chefe',
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(defaultAuth));
      return defaultAuth;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      isAuthenticated: true,
      email: 'admin@bigartfogos.com.br',
      name: 'Administrador Big Art',
      role: 'Diretor / Blaster Chefe',
    };
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
  notifyChange(STORAGE_KEYS.AUTH);
}

export function logout() {
  const session: AuthSession = {
    isAuthenticated: false,
    email: '',
    name: '',
    role: '',
  };
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
  notifyChange(STORAGE_KEYS.AUTH);
}
