import React from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  PlusCircle,
  FilePlus2,
  ArrowRight,
  Eye,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { Product, Quote } from '../types';
import { formatCurrencyBRL, formatDateBR } from '../utils/calculator';
import { ActivePage } from './Navigation';

interface DashboardViewProps {
  products: Product[];
  quotes: Quote[];
  onNavigate: (page: ActivePage) => void;
  onEditQuote: (quote: Quote) => void;
  onOpenNewProduct: () => void;
  onGeneratePdf: (quote: Quote, type: 'internal' | 'client') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  quotes,
  onNavigate,
  onEditQuote,
  onOpenNewProduct,
  onGeneratePdf,
}) => {
  // Calculations
  const totalProductsCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0);
  const lowStockProducts = products.filter(
    (p) => Number(p.stockQuantity) <= Number(p.minStockQuantity)
  );

  const totalQuotesCount = quotes.length;
  const pendingQuotes = quotes.filter((q) => q.status === 'Rascunho' || q.status === 'Enviado');
  const approvedQuotes = quotes.filter((q) => q.status === 'Aprovado');
  const cancelledQuotes = quotes.filter((q) => q.status === 'Cancelado');

  const totalApprovedValue = approvedQuotes.reduce((acc, q) => {
    const val = q.manualNegotiatedPrice ?? q.items.reduce((iAcc, item) => iAcc + item.quantity * item.unitSale, 0);
    return acc + (Number(val) || 0);
  }, 0);

  const totalQuotesValue = quotes.reduce((acc, q) => {
    const val = q.manualNegotiatedPrice ?? q.items.reduce((iAcc, item) => iAcc + item.quantity * item.unitSale, 0);
    return acc + (Number(val) || 0);
  }, 0);

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Sistema Administrativo de Gestão</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Painel Geral — BIG ART FOGOS
          </h2>
          <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
            Acompanhe indicadores de estoque de fogos de artifício, monitore propostas comerciais em tempo real e emita orçamentos profissionais.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('new-quote')}
            className="flex items-center space-x-2 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all transform active:scale-95"
          >
            <FilePlus2 size={18} className="text-emerald-600" />
            <span>Criar Orçamento</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="flex items-center space-x-2 bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-400/40 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <PlusCircle size={18} />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase">Produtos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalProductsCount}</span>
            <span className="text-xs text-gray-400">cadastrados</span>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            Ver catálogo <ArrowRight size={12} />
          </button>
        </div>

        {/* Total Stock Units */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase">Estoque Total</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalStockUnits}</span>
            <span className="text-xs text-gray-400">unidades</span>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="mt-3 text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            Movimentações <ArrowRight size={12} />
          </button>
        </div>

        {/* Low Stock */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/50 border-amber-300 shadow-xs'
              : 'bg-white border-gray-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 uppercase">Estoque Baixo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-900">{lowStockProducts.length}</span>
            <span className="text-xs text-amber-700 font-medium">alerta(s)</span>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="mt-3 text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
          >
            Repor itens <ArrowRight size={12} />
          </button>
        </div>

        {/* Total Value Accumulated */}
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase">Valor Aprovado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-700">
              {formatCurrencyBRL(totalApprovedValue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            Total em propostas: {formatCurrencyBRL(totalQuotesValue)}
          </div>
        </div>
      </div>

      {/* Quote Status Badges Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{totalQuotesCount}</div>
            <div className="text-xs text-gray-500 font-medium">Total de Orçamentos</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{pendingQuotes.length}</div>
            <div className="text-xs text-gray-500 font-medium">Pendentes / Enviados</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{approvedQuotes.length}</div>
            <div className="text-xs text-gray-500 font-medium">Aprovados</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-red-600">{cancelledQuotes.length}</div>
            <div className="text-xs text-gray-500 font-medium">Cancelados</div>
          </div>
        </div>
      </div>

      {/* Low Stock Banner Alert (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Atenção: {lowStockProducts.length} produto(s) com quantidade em estoque igual ou inferior ao mínimo!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStockProducts.map((p) => `${p.name} (${p.stockQuantity} ${p.unit})`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            Realizar Entrada de Estoque
          </button>
        </div>
      )}

      {/* Recent Quotes Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Orçamentos Recentes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Últimas propostas comerciais elaboradas no sistema
            </p>
          </div>
          <button
            onClick={() => onNavigate('quotes')}
            className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            Ver todos ({quotes.length}) <ArrowRight size={14} />
          </button>
        </div>

        {recentQuotes.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum orçamento cadastrado ainda</p>
            <button
              onClick={() => onNavigate('new-quote')}
              className="mt-3 inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <FilePlus2 size={16} />
              <span>Criar Primeiro Orçamento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Número</th>
                  <th className="px-5 py-3">Orçamento / Cliente</th>
                  <th className="px-5 py-3">Data Evento</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Valor Final</th>
                  <th className="px-5 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentQuotes.map((q) => {
                  const finalVal =
                    q.manualNegotiatedPrice ??
                    q.items.reduce((acc, i) => acc + i.quantity * i.unitSale, 0);

                  const statusStyles = {
                    Aprovado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    Enviado: 'bg-blue-100 text-blue-800 border-blue-200',
                    Rascunho: 'bg-amber-100 text-amber-800 border-amber-200',
                    Cancelado: 'bg-red-100 text-red-800 border-red-200',
                  }[q.status] || 'bg-gray-100 text-gray-800';

                  return (
                    <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900 whitespace-nowrap">
                        {q.number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{q.name}</div>
                        <div className="text-xs text-gray-500">{q.client.name || 'Cliente não informado'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateBR(q.event.date) || '-'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles}`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrencyBRL(Number(finalVal) || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onEditQuote(q)}
                            title="Editar orçamento"
                            className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onGeneratePdf(q, 'client')}
                            title="Gerar PDF do Cliente"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FileDown size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
