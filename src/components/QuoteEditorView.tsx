import React, { useState, useMemo, useEffect } from 'react';
import {
  Save,
  Copy,
  FileDown,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  Search,
  MoveUp,
  MoveDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Percent,
} from 'lucide-react';
import {
  AdditionalCost,
  Product,
  Quote,
  QuoteExecution,
  QuoteItem,
  QuoteStatus,
} from '../types';
import {
  calculateQuoteFinancials,
  formatCurrencyBRL,
  formatDateBR,
  roundToTwoDecimals,
} from '../utils/calculator';
import { getNextQuoteNumber } from '../services/storage';

interface QuoteEditorViewProps {
  initialQuote?: Quote | null;
  products: Product[];
  onSaveQuote: (quote: Partial<Quote>, asNewCopy?: boolean) => void;
  onGeneratePdf: (quote: Quote, type: 'internal' | 'client') => void;
  onCancel: () => void;
}

export const QuoteEditorView: React.FC<QuoteEditorViewProps> = ({
  initialQuote,
  products,
  onSaveQuote,
  onGeneratePdf,
  onCancel,
}) => {
  // Quote Base Info
  const [quoteId, setQuoteId] = useState<string>(initialQuote?.id || '');
  const [number, setNumber] = useState<string>(initialQuote?.number || '');
  const [sequentialNumber, setSequentialNumber] = useState<number>(initialQuote?.sequentialNumber || 1);
  const [name, setName] = useState<string>(initialQuote?.name || '');
  const [status, setStatus] = useState<QuoteStatus>(initialQuote?.status || 'Rascunho');
  const [createdAt, setCreatedAt] = useState<string>(
    initialQuote?.createdAt || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(
    initialQuote?.validUntil ||
      new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );

  // Client Info
  const [clientName, setClientName] = useState(initialQuote?.client.name || '');
  const [contactPerson, setContactPerson] = useState(initialQuote?.client.contactPerson || '');
  const [cpfCnpj, setCpfCnpj] = useState(initialQuote?.client.cpfCnpj || '');
  const [phone, setPhone] = useState(initialQuote?.client.phone || '');
  const [email, setEmail] = useState(initialQuote?.client.email || '');
  const [address, setAddress] = useState(initialQuote?.client.address || '');
  const [clientNotes, setClientNotes] = useState(initialQuote?.client.notes || '');

  // Event Info
  const [eventName, setEventName] = useState(initialQuote?.event.name || '');
  const [city, setCity] = useState(initialQuote?.event.city || '');
  const [eventDate, setEventDate] = useState(initialQuote?.event.date || '');
  const [eventTime, setEventTime] = useState(initialQuote?.event.time || '');
  const [location, setLocation] = useState(initialQuote?.event.location || '');
  const [executionTime, setExecutionTime] = useState(initialQuote?.event.executionTime || '');
  const [eventNotes, setEventNotes] = useState(initialQuote?.event.notes || '');

  // Items
  const [items, setItems] = useState<QuoteItem[]>(initialQuote?.items || []);

  // Additional Internal Costs
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>(
    initialQuote?.additionalCosts || []
  );

  // Commercial adjustments
  const [commercialSurcharge, setCommercialSurcharge] = useState<number | string>(
    initialQuote?.commercialSurcharge || 0
  );
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>(
    initialQuote?.discountType || 'FIXED'
  );
  const [discountValue, setDiscountValue] = useState<number | string>(
    initialQuote?.discountValue || 0
  );

  // Project Execution
  const [execution, setExecution] = useState<QuoteExecution>(
    initialQuote?.execution || {
      title: 'Execução de Show Pirotécnico',
      description:
        'Planejamento técnico e layout de disparos pirotécnicos.\nMontagem de estrutura e tubos de lançamento com baterias certificadas.\nEquipe de blaster pirotécnico habilitada com equipamentos de segurança.\nAcionamento por sistema eletrônico e digital sem fio com chave de segurança.\nIsolamento de segurança e coordenação geral com o evento.\nLimpeza e varredura de resíduos pós-evento.',
      internalCost: 0,
      chargedPrice: 0,
      showDescriptionInClientPdf: true,
    }
  );

  // Manual Negotiated Price
  const [manualNegotiatedPrice, setManualNegotiatedPrice] = useState<number | null>(
    initialQuote?.manualNegotiatedPrice ?? null
  );
  const [manualInputVal, setManualInputVal] = useState<string>(
    initialQuote?.manualNegotiatedPrice !== null && initialQuote?.manualNegotiatedPrice !== undefined
      ? String(initialQuote.manualNegotiatedPrice)
      : ''
  );

  // Notes & Terms
  const [notes, setNotes] = useState(initialQuote?.notes || '');
  const [terms, setTerms] = useState(
    initialQuote?.terms ||
      'Condições de pagamento: 50% de entrada na confirmação da reserva e 50% até 24 horas antes do evento. A montagem técnica segue rigorosamente as normas de segurança do Corpo de Bombeiros Militar.'
  );

  // UI helpers
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [costInputDesc, setCostInputDesc] = useState('');
  const [costInputValue, setCostInputValue] = useState<number | string>(0);

  // Initialize quote number if new
  useEffect(() => {
    if (!initialQuote) {
      const next = getNextQuoteNumber();
      setNumber(next.number);
      setSequentialNumber(next.sequentialNumber);
      setName(`Orçamento ${next.number}`);
    }
  }, [initialQuote]);

  // Real-time calculations
  const financials = useMemo(() => {
    return calculateQuoteFinancials({
      items,
      additionalCosts,
      execution,
      commercialSurcharge: Number(commercialSurcharge) || 0,
      discountType,
      discountValue: Number(discountValue) || 0,
      manualNegotiatedPrice: manualNegotiatedPrice,
    });
  }, [items, additionalCosts, execution, commercialSurcharge, discountType, discountValue, manualNegotiatedPrice]);

  // Keep manualInputVal in sync if manualNegotiatedPrice changes externally
  useEffect(() => {
    if (manualNegotiatedPrice !== null && manualNegotiatedPrice !== undefined) {
      setManualInputVal(String(manualNegotiatedPrice));
    } else {
      setManualInputVal('');
    }
  }, [manualNegotiatedPrice]);

  // Product Selection search results
  const searchResults = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 10);
    const term = productSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return products.filter((p) => {
      const nameNorm = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const codeNorm = p.code.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return nameNorm.includes(term) || codeNorm.includes(term);
    });
  }, [productSearch, products]);

  // Add Product to Quote
  const handleAddProduct = (prod: Product) => {
    const newItem: QuoteItem = {
      id: 'qitem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      description: prod.description || '',
      photoUrl: prod.images?.[0],
      quantity: 1,
      unitCost: prod.costPrice,
      unitSale: prod.salePrice,
      totalCost: prod.costPrice,
      totalSale: prod.salePrice,
    };

    setItems((prev) => [...prev, newItem]);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Update Item in quote
  const handleUpdateItem = (
    itemId: string,
    field: 'quantity' | 'unitSale' | 'description',
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        let updated = { ...item };
        if (field === 'quantity') {
          const qty = Math.max(1, Number(value) || 1);
          updated.quantity = qty;
          updated.totalCost = roundToTwoDecimals(qty * item.unitCost);
          updated.totalSale = roundToTwoDecimals(qty * item.unitSale);
        } else if (field === 'unitSale') {
          const sale = Math.max(0, Number(value) || 0);
          updated.unitSale = sale;
          updated.totalSale = roundToTwoDecimals(item.quantity * sale);
        } else if (field === 'description') {
          updated.description = String(value);
        }
        return updated;
      })
    );
  };

  const handleDuplicateItem = (itemToDup: QuoteItem) => {
    const copy: QuoteItem = {
      ...itemToDup,
      id: 'qitem-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    };
    setItems((prev) => [...prev, copy]);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  // Additional Costs handlers
  const handleAddCost = () => {
    if (!costInputDesc.trim()) return;
    const num = Number(costInputValue) || 0;
    const newCost: AdditionalCost = {
      id: 'ac-' + Date.now(),
      description: costInputDesc.trim(),
      cost: num,
    };
    setAdditionalCosts((prev) => [...prev, newCost]);
    setCostInputDesc('');
    setCostInputValue(0);
  };

  const handleRemoveCost = (costId: string) => {
    setAdditionalCosts((prev) => prev.filter((c) => c.id !== costId));
  };

  // Manual Negotiated Price Handler
  const handleManualPriceChange = (valStr: string) => {
    setManualInputVal(valStr);
    if (valStr.trim() === '') {
      setManualNegotiatedPrice(null);
    } else {
      const parsed = parseFloat(valStr.replace(',', '.'));
      if (!isNaN(parsed)) {
        setManualNegotiatedPrice(parsed);
      }
    }
  };

  const handleRestoreCalculatedPrice = () => {
    setManualNegotiatedPrice(null);
    setManualInputVal('');
  };

  // Build the complete Quote object
  const buildCurrentQuote = (): Quote => {
    return {
      id: quoteId || 'quote-' + Date.now(),
      number,
      sequentialNumber,
      name: name.trim() || `Orçamento ${number}`,
      status,
      createdAt,
      validUntil,
      updatedAt: new Date().toISOString(),
      client: {
        name: clientName.trim(),
        contactPerson: contactPerson.trim(),
        cpfCnpj: cpfCnpj.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        notes: clientNotes.trim(),
      },
      event: {
        name: eventName.trim(),
        city: city.trim(),
        date: eventDate,
        time: eventTime.trim(),
        location: location.trim(),
        executionTime: executionTime.trim(),
        notes: eventNotes.trim(),
      },
      items,
      additionalCosts,
      commercialSurcharge: Number(commercialSurcharge) || 0,
      discountType,
      discountValue: Number(discountValue) || 0,
      execution,
      manualNegotiatedPrice,
      notes: notes.trim(),
      terms: terms.trim(),
    };
  };

  const handleSave = (asNewCopy: boolean = false) => {
    const quoteData = buildCurrentQuote();
    onSaveQuote(quoteData, asNewCopy);
    setSaveSuccessMsg(
      asNewCopy
        ? 'Orçamento duplicado com sucesso com novo identificador!'
        : 'Alterações no orçamento salvas com sucesso!'
    );
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
              {number}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                status === 'Aprovado'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'Enviado'
                  ? 'bg-blue-100 text-blue-800'
                  : status === 'Cancelado'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {status}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {initialQuote ? 'Editar Orçamento Comercial' : 'Elaborar Novo Orçamento'}
          </h2>
          <p className="text-xs text-gray-500">
            Preencha dados do cliente, evento, produtos e calcule custos e margem em tempo real
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Voltar
          </button>

          {initialQuote && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <Copy size={15} />
              <span>Salvar como Novo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Save size={15} />
            <span>{initialQuote ? 'Salvar Alterações' : 'Salvar Orçamento'}</span>
          </button>

          {/* Quick PDF trigger dropdown */}
          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200">
            <button
              type="button"
              onClick={() => onGeneratePdf(buildCurrentQuote(), 'client')}
              title="Gerar Proposta Comercial para o Cliente"
              className="flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <FileDown size={15} />
              <span>PDF Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => onGeneratePdf(buildCurrentQuote(), 'internal')}
              title="Gerar Controle Interno Administrativo (Confidencial)"
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <FileDown size={15} />
              <span>PDF Interno</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Sections (Left) + Sticky Financial Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Quote Header Details */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-600" />
              <span>Dados Gerais da Proposta</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Personalizado do Orçamento *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Show Pirotécnico Réveillon 2027 Lago"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Status da Proposta
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="Rascunho">Rascunho</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Data de Emissão
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Validade da Proposta
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Client Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">1. Informações do Cliente</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome do Cliente / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Prefeitura Municipal de Muzambinho"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Responsável / Contato
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ex: Carlos Eduardo (Sec. de Cultura)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CPF ou CNPJ (Opcional)
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  placeholder="Ex: 00.000.000/0001-00"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (35) 99876-5432"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: contato@cliente.com.br"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Endereço do Cliente
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Praça Central, 100 - Muzambinho - MG"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Event Info */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">2. Informações do Evento</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome ou Tipo do Evento
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Ex: Show da Virada Réveillon 2027"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cidade do Evento
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Muzambinho - MG"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Data do Evento
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Horário do Evento
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Previsão de Horário do Disparo
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="time"
                    value={executionTime}
                    onChange={(e) => setExecutionTime(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Local Específico do Evento / Terreno
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Balsa central do Lago Municipal ou Estádio / Chácara"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Products Selection and Items Table */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  3. Produtos e Efeitos Pirotécnicos ({items.length} itens)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Pesquise e adicione produtos ao orçamento sem limite de registros
                </p>
              </div>

              {/* Instant Search and Add Bar */}
              <div className="relative sm:w-72">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setShowProductDropdown(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  placeholder="Buscar produto por nome ou código..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />

                {showProductDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        className="p-2.5 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">
                            [{p.code}] • Venda padrão: {formatCurrencyBRL(p.salePrice)} • Estoque: {p.stockQuantity} {p.unit}
                          </div>
                        </div>
                        <Plus size={16} className="text-emerald-700 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                <p className="text-xs font-bold text-gray-600">Nenhum produto adicionado ao orçamento</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Utilize o campo de busca acima para selecionar itens do catálogo.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0 text-gray-400 text-xs font-bold">
                            {idx + 1}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                              {item.productCode}
                            </span>
                            <span className="font-bold text-sm text-gray-900 truncate">
                              {item.productName}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            Custo Unit: {formatCurrencyBRL(item.unitCost)} | Subtotal Venda: <strong className="text-emerald-800">{formatCurrencyBRL(item.totalSale)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Item Control actions (up, down, duplicate, delete) */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          title="Mover para cima"
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                        >
                          <MoveUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          title="Mover para baixo"
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                        >
                          <MoveDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item)}
                          title="Duplicar item"
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remover do orçamento"
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Inputs row: Quantity, Quote Price, Description */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-200/60">
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          Quantidade
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold text-emerald-800 mb-0.5">
                          Preço Venda Unitário (Neste Orçamento)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitSale}
                          onChange={(e) => handleUpdateItem(item.id, 'unitSale', e.target.value)}
                          className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[9px] text-gray-400">Preço original do estoque preservado</span>
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                          Descrição / Efeito (Exibida na proposta)
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Descrição personalizada para este orçamento"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Additional Internal Costs (CONFIDENTIAL) */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-gray-900">4. Custos Adicionais do Orçamento</h3>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Confidencial — Não aparece no PDF do cliente
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Despesas internas operacionais (combustível, transporte, alimentação, hospedagem, materiais)
                </p>
              </div>
            </div>

            {/* Add cost form row */}
            <div className="flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input
                type="text"
                value={costInputDesc}
                onChange={(e) => setCostInputDesc(e.target.value)}
                placeholder="Descrição (ex: Transporte Muzambinho, Hospedagem equipe, etc.)"
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costInputValue}
                  onChange={(e) => setCostInputValue(e.target.value)}
                  placeholder="Valor Custo R$"
                  className="w-32 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCost}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* List of additional costs */}
            {additionalCosts.length > 0 && (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                {additionalCosts.map((cost) => (
                  <div key={cost.id} className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-800">{cost.description}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-gray-900">{formatCurrencyBRL(cost.cost)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCost(cost.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-2.5 bg-gray-50 flex items-center justify-between text-xs font-bold">
                  <span>Total de Custos Adicionais:</span>
                  <span className="text-gray-900">{formatCurrencyBRL(financials.additionalCostsTotal)}</span>
                </div>
              </div>
            )}

            {/* Commercial Surcharge Input (Acréscimo comercial opcional) */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Acréscimo Comercial para Cobrir Custos (Opcional)
                </label>
                <p className="text-[10px] text-gray-500">
                  Valor a ser somado ao preço de venda para repassar essas despesas ao cliente.
                </p>
              </div>
              <div className="w-40">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={commercialSurcharge}
                  onChange={(e) => setCommercialSurcharge(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Project Execution */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">5. Execução do Projeto / Show Pirotécnico</h3>
                <p className="text-[11px] text-gray-500">
                  Configuração de montagem, equipe de blaster e serviço operacional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  Valor Cobrado pela Execução (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={execution.chargedPrice}
                  onChange={(e) =>
                    setExecution((prev) => ({
                      ...prev,
                      chargedPrice: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-white border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-gray-500">
                  Soma ao total do cliente sem discriminação de item separado.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Custo Interno da Execução (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={execution.internalCost}
                  onChange={(e) =>
                    setExecution((prev) => ({
                      ...prev,
                      internalCost: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-gray-500">
                  Gasto real com equipe, diárias e blaster (Confidencial).
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Título do Serviço de Execução
              </label>
              <input
                type="text"
                value={execution.title}
                onChange={(e) =>
                  setExecution((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Execução de Show Pirotécnico Profissional"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Descrição Detalhada da Execução (Etapas, Segurança e Blaster)
              </label>
              <textarea
                rows={4}
                value={execution.description}
                onChange={(e) =>
                  setExecution((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Descreva planejamento, montagem, equipe de blaster, sistema digital de disparo sem fio, procedimentos de segurança..."
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="showExecDesc"
                checked={execution.showDescriptionInClientPdf}
                onChange={(e) =>
                  setExecution((prev) => ({
                    ...prev,
                    showDescriptionInClientPdf: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <label htmlFor="showExecDesc" className="text-xs font-bold text-gray-800 cursor-pointer">
                Exibir descrição técnica da execução no PDF do cliente (sem expor preço individual)
              </label>
            </div>
          </div>

          {/* Section 7: Commercial Discounts & Terms */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">6. Desconto Comercial e Condições</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Desconto Comercial
                </label>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-2 text-xs font-bold"
                  >
                    <option value="FIXED">R$ Fixo</option>
                    <option value="PERCENT">% Porcentagem</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                {financials.discountAmount > 0 && (
                  <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                    Impacto do desconto: -{formatCurrencyBRL(financials.discountAmount)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Observações Gerais
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Incluso suporte técnico com bombeiro civil..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Condições Comerciais e Formas de Pagamento
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Financial Calculator (4 cols, Sticky) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Calculadora em Tempo Real</h3>
                  <p className="text-[10px] text-gray-500">Atualização instantânea dos custos e lucro</p>
                </div>
              </div>
            </div>

            {/* Breakdown lines */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Itens Selecionados:</span>
                <span className="font-bold text-gray-900">{financials.totalItemsCount} un</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Custo dos Produtos:</span>
                <span className="font-medium">{formatCurrencyBRL(financials.productsTotalCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Venda dos Produtos:</span>
                <span className="font-medium">{formatCurrencyBRL(financials.productsTotalSale)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Custos Adicionais Internos:</span>
                <span className="font-medium">{formatCurrencyBRL(financials.additionalCostsTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Custo Interno Execução:</span>
                <span className="font-medium">{formatCurrencyBRL(financials.internalExecutionCost)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Valor Cobrado Execução:</span>
                <span className="font-medium text-emerald-700">+{formatCurrencyBRL(financials.chargedExecutionPrice)}</span>
              </div>

              {financials.commercialSurcharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Acréscimo Comercial:</span>
                  <span className="font-medium text-emerald-700">+{formatCurrencyBRL(financials.commercialSurcharge)}</span>
                </div>
              )}

              {financials.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto Comercial:</span>
                  <span className="font-medium">-{formatCurrencyBRL(financials.discountAmount)}</span>
                </div>
              )}
            </div>

            {/* Subtotals: Custo Geral vs Venda Calculada */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">CUSTO GERAL:</span>
                <span className="font-bold text-red-700 text-sm">
                  {formatCurrencyBRL(financials.generalCost)}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-50/70 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">VENDA CALCULADA:</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {formatCurrencyBRL(financials.calculatedSale)}
                </span>
              </div>
            </div>

            {/* HIGHLIGHT: VALOR FINAL NEGOCIADO (Section 15) */}
            <div className="p-4 bg-emerald-800 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  VALOR FINAL NEGOCIADO (R$)
                </label>
                {financials.isManualPriceActive && (
                  <span className="text-[9px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded font-bold">
                    Manual Ativo
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={manualInputVal}
                  onChange={(e) => handleManualPriceChange(e.target.value)}
                  placeholder={String(financials.calculatedSale)}
                  className="w-full bg-white text-gray-950 font-extrabold text-xl px-3 py-2 rounded-lg border-2 border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-white"
                />
              </div>

              <p className="text-[10px] text-emerald-200">
                {financials.isManualPriceActive
                  ? `Preço ajustado manualmente. Diferença: ${financials.differenceFromCalculated >= 0 ? '+' : ''}${formatCurrencyBRL(financials.differenceFromCalculated)} em relação à venda calculada.`
                  : 'Preço utilizando o total automático calculado. Digite acima para negociar manualmente.'}
              </p>

              {financials.isManualPriceActive && (
                <button
                  type="button"
                  onClick={handleRestoreCalculatedPrice}
                  className="w-full mt-2 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar Valor Calculado ({formatCurrencyBRL(financials.calculatedSale)})</span>
                </button>
              )}
            </div>

            {/* Profit & Gross Margin */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Lucro Bruto Estimado:</span>
                <span
                  className={`font-bold text-sm ${
                    financials.estimatedGrossProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {formatCurrencyBRL(financials.estimatedGrossProfit)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Margem Bruta:</span>
                <span
                  className={`font-bold text-sm ${
                    (financials.grossMarginPercent || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {financials.grossMarginPercent !== null
                    ? `${financials.grossMarginPercent.toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Quick Actions in Sidebar */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Save size={16} />
                <span>Salvar Proposta</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onGeneratePdf(buildCurrentQuote(), 'client')}
                  className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <FileDown size={14} />
                  <span>PDF Cliente</span>
                </button>

                <button
                  type="button"
                  onClick={() => onGeneratePdf(buildCurrentQuote(), 'internal')}
                  className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <FileDown size={14} />
                  <span>PDF Interno</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
