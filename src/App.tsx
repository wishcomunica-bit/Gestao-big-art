import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivePage,
  Navigation,
} from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ProductFormModal } from './components/ProductFormModal';
import { StockMovementsView } from './components/StockMovementsView';
import { QuoteEditorView } from './components/QuoteEditorView';
import { SavedQuotesView } from './components/SavedQuotesView';
import { CompanySettingsView } from './components/CompanySettingsView';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { LoginView } from './components/LoginView';
import {
  AuthSession,
  deleteProduct,
  deleteQuote,
  duplicateQuote,
  getAuthSession,
  getCompanySettings,
  getStoredCategories,
  getStoredColors,
  getStoredMovements,
  getStoredProducts,
  getStoredQuotes,
  logout,
  saveCompanySettings,
  saveProduct,
  saveQuote,
  setAuthSession,
  updateProductStock,
} from './services/storage';
import { CompanySettings, MovementType, Product, Quote, StockMovement } from './types';

export function App() {
  // App state
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [session, setSession] = useState<AuthSession>(getAuthSession());
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings());

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [activeQuoteToEdit, setActiveQuoteToEdit] = useState<Quote | null>(null);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfQuote, setPdfQuote] = useState<Quote | null>(null);
  const [pdfType, setPdfType] = useState<'client' | 'internal'>('client');

  const [preselectedStockProduct, setPreselectedStockProduct] = useState<Product | null>(null);

  // Load state from persistent storage
  const loadData = useCallback(() => {
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
    setColors(getStoredColors());
    setMovements(getStoredMovements());
    setQuotes(getStoredQuotes());
    setSettings(getCompanySettings());
    setSession(getAuthSession());
  }, []);

  useEffect(() => {
    loadData();

    // Listen to custom storage update events for immediate multi-view synchronization
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('bigart_storage_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bigart_storage_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadData]);

  // Auth handlers
  const handleLoginSuccess = (newSession: AuthSession) => {
    setAuthSession(newSession);
    setSession(newSession);
  };

  const handleLogout = () => {
    logout();
    setSession(getAuthSession());
  };

  // Product actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (prodData: Partial<Product> & { name: string; code: string }) => {
    saveProduct(prodData);
    loadData();
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    loadData();
  };

  // Stock action
  const handleQuickStockMovement = (prod: Product) => {
    setPreselectedStockProduct(prod);
    setActivePage('stock');
  };

  const handleUpdateStock = (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string
  ) => {
    const res = updateProductStock(productId, type, quantity, reason);
    if (res.success) {
      loadData();
    }
    return res;
  };

  // Quote actions
  const handleEditQuote = (quote: Quote) => {
    setActiveQuoteToEdit(quote);
    setActivePage('edit-quote');
  };

  const handleSaveQuote = (quoteData: Partial<Quote>, asNewCopy: boolean = false) => {
    if (asNewCopy && quoteData.id) {
      const copy = duplicateQuote(quoteData.id);
      if (copy) {
        loadData();
        setActiveQuoteToEdit(copy);
      }
    } else {
      const saved = saveQuote(quoteData);
      loadData();
      setActiveQuoteToEdit(saved);
    }
  };

  const handleDuplicateQuote = (quoteId: string) => {
    const copy = duplicateQuote(quoteId);
    if (copy) {
      loadData();
    }
  };

  const handleDeleteQuote = (quoteId: string) => {
    deleteQuote(quoteId);
    loadData();
  };

  // PDF action
  const handleGeneratePdf = (quote: Quote, type: 'internal' | 'client') => {
    setPdfQuote(quote);
    setPdfType(type);
    setIsPdfModalOpen(true);
  };

  // Settings
  const handleSaveSettings = (newSettings: CompanySettings) => {
    const updated = saveCompanySettings(newSettings);
    setSettings(updated);
  };

  // Calculations for badges
  const lowStockCount = products.filter(
    (p) => Number(p.stockQuantity) <= Number(p.minStockQuantity)
  ).length;

  // If user is unauthenticated, show corporate login view
  if (!session.isAuthenticated) {
    return <LoginView settings={settings} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation (Sidebar desktop + Topbar mobile) */}
      <Navigation
        activePage={activePage}
        onNavigate={(page) => {
          if (page === 'new-quote') {
            setActiveQuoteToEdit(null);
          }
          setActivePage(page);
        }}
        session={session}
        settings={settings}
        onLogout={handleLogout}
        lowStockCount={lowStockCount}
        quotesCount={quotes.length}
      />

      {/* Main Content Area - lg:pl-72 offsets the fixed desktop sidebar */}
      <div className="flex-1 w-full lg:pl-72 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {activePage === 'dashboard' && (
            <DashboardView
              products={products}
              quotes={quotes}
              onNavigate={setActivePage}
              onEditQuote={handleEditQuote}
              onOpenNewProduct={handleOpenNewProduct}
              onGeneratePdf={handleGeneratePdf}
            />
          )}

          {activePage === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              colors={colors}
              onOpenNewProduct={handleOpenNewProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onQuickStockMovement={handleQuickStockMovement}
            />
          )}

          {(activePage === 'new-quote' || activePage === 'edit-quote') && (
            <QuoteEditorView
              key={activeQuoteToEdit?.id || 'new-quote'}
              initialQuote={activePage === 'edit-quote' ? activeQuoteToEdit : null}
              products={products}
              onSaveQuote={handleSaveQuote}
              onGeneratePdf={handleGeneratePdf}
              onCancel={() => setActivePage('quotes')}
            />
          )}

          {activePage === 'quotes' && (
            <SavedQuotesView
              quotes={quotes}
              onNewQuote={() => {
                setActiveQuoteToEdit(null);
                setActivePage('new-quote');
              }}
              onEditQuote={handleEditQuote}
              onDuplicateQuote={handleDuplicateQuote}
              onDeleteQuote={handleDeleteQuote}
              onGeneratePdf={handleGeneratePdf}
            />
          )}

          {activePage === 'stock' && (
            <StockMovementsView
              products={products}
              movements={movements}
              onUpdateStock={handleUpdateStock}
              preselectedProduct={preselectedStockProduct}
            />
          )}

          {activePage === 'settings' && (
            <CompanySettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        quote={pdfQuote}
        settings={settings}
        initialType={pdfType}
      />
    </div>
  );
}

export default App;
