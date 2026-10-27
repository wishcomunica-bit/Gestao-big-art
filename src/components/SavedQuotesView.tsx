import React, { useState, useMemo } from 'react';
import {
  Search,
  FilePlus2,
  Edit2,
  Copy,
  Trash2,
  FileDown,
  Eye,
  Calendar,
  X,
  FileText,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { Quote, QuoteStatus } from '../types';
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from '../utils/calculator';

interface SavedQuotesViewProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quoteId: string) => void;
  onDeleteQuote: (quoteId: string) => void;
  onGeneratePdf: (quote: Quote, type: 'internal' | 'client') => void;
}

export const SavedQuotesView: React.FC<SavedQuotesViewProps> = ({
  quotes,
  onNewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onGeneratePdf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuoteStatus>('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteConfirmQuote, setDeleteConfirmQuote] = useState<Quote | null>(null);
  const [quickViewQuote, setQuickViewQuote] = useState<Quote | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const normalize = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredQuotes = useMemo(() => {
    const term = normalize(searchTerm);

    return quotes.filter((q) => {
      // Search in number, name, client name
      const matchesSearch =
        !term ||
        normalize(q.number).includes(term) ||
        normalize(q.name).includes(term) ||
        normalize(q.client.name).includes(term) ||
        normalize(q.event.city).includes(term);

      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

      const matchesDate = !dateFilter || q.createdAt === dateFilter || q.event.date === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [quotes, searchTerm, statusFilter, dateFilter]);

  const handleDuplicate = (q: Quote) => {
    onDuplicateQuote(q.id);
    setFeedbackMsg(`Orçamento ${q.number} duplicado com sucesso!`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const confirmDelete = () => {
    if (deleteConfirmQuote) {
      onDeleteQuote(deleteConfirmQuote.id);
      setDeleteConfirmQuote(null);
      setFeedbackMsg('Orçamento excluído com sucesso.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Orçamentos Comerciais Salvos
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie todas as propostas emitidas, duplique para novos eventos e emita PDFs
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors shrink-0"
        >
          <FilePlus2 size={18} />
          <span>Criar Novo Orçamento</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Instant Search input */}
          <div className="md:col-span-6 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por número (ORC-0001), nome da proposta ou cliente..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado">Enviado</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-3">
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Counter of results */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Exibindo <strong>{filteredQuotes.length}</strong> de {quotes.length} orçamentos
          </span>
          {(searchTerm || statusFilter !== 'ALL' || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setDateFilter('');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table of Saved Quotes */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={44} className="mx-auto mb-2 opacity-40" />
            <p className="text-base font-bold text-gray-700">Nenhum orçamento encontrado</p>
            <p className="text-xs text-gray-500 mt-1">
              Verifique os filtros aplicados ou elabore um novo orçamento comercial.
            </p>
            <button
              onClick={onNewQuote}
              className="mt-4 inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-emerald-700"
            >
              <FilePlus2 size={16} />
              <span>Novo Orçamento</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Número</th>
                  <th className="px-5 py-3">Nome / Cliente</th>
                  <th className="px-5 py-3">Emissão / Validade</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Valor Final</th>
                  <th className="px-5 py-3 text-center">PDFs</th>
                  <th className="px-5 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((q) => {
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
                      {/* Quote Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          {q.number}
                        </span>
                        {q.version && q.version > 1 && (
                          <span className="ml-1 text-[10px] text-gray-400 font-normal">
                            v{q.version}
                          </span>
                        )}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Modif: {formatDateTimeBR(q.updatedAt)}
                        </div>
                      </td>

                      {/* Name & Client */}
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-bold text-gray-900 line-clamp-1">{q.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                          <span>{q.client.name || 'Cliente não informado'}</span>
                          {q.event.city && (
                            <span className="text-[10px] bg-gray-100 px-1.5 rounded">
                              {q.event.city}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-600">
                        <div>Emissão: <strong>{formatDateBR(q.createdAt)}</strong></div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Validade: {formatDateBR(q.validUntil)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles}`}
                        >
                          {q.status}
                        </span>
                      </td>

                      {/* Final Negotiated Value */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span className="font-extrabold text-base text-gray-900">
                          {formatCurrencyBRL(Number(finalVal) || 0)}
                        </span>
                        {q.manualNegotiatedPrice !== null && (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            Manual Negociado
                          </div>
                        )}
                      </td>

                      {/* Quick PDF buttons */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onGeneratePdf(q, 'client')}
                            title="Gerar PDF do Cliente (Apenas valor total)"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
                          >
                            <FileDown size={14} />
                            <span>Cliente</span>
                          </button>
                          <button
                            onClick={() => onGeneratePdf(q, 'internal')}
                            title="Gerar PDF Interno (Custos, margem e lucros)"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200"
                          >
                            <FileDown size={14} />
                            <span>Interno</span>
                          </button>
                        </div>
                      </td>

                      {/* Item Actions */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setQuickViewQuote(q)}
                            title="Visualizar proposta"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onEditQuote(q)}
                            title="Editar orçamento"
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(q)}
                            title="Duplicar como novo orçamento"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmQuote(q)}
                            title="Excluir orçamento"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
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

      {/* Quick View Proposal Modal */}
      {quickViewQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {quickViewQuote.number}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{quickViewQuote.name}</h3>
              </div>
              <button
                onClick={() => setQuickViewQuote(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Client & Event */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 font-medium">Cliente:</span>
                  <div className="font-bold text-gray-900 text-sm">{quickViewQuote.client.name}</div>
                  <div className="text-gray-600">{quickViewQuote.client.phone} | {quickViewQuote.client.email}</div>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Evento:</span>
                  <div className="font-bold text-gray-900">{quickViewQuote.event.name || 'Show Pirotécnico'}</div>
                  <div className="text-gray-600">
                    {quickViewQuote.event.city} - {formatDateBR(quickViewQuote.event.date)} às {quickViewQuote.event.time}
                  </div>
                </div>
              </div>

              {/* Products items summary */}
              <div>
                <span className="font-bold text-gray-800 block mb-2">Itens Inclusos ({quickViewQuote.items.length}):</span>
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {quickViewQuote.items.map((item, idx) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">{idx + 1}.</span>
                        <span className="font-bold text-gray-900">{item.productName}</span>
                        <span className="text-gray-500 font-mono text-[11px]">({item.productCode})</span>
                      </div>
                      <span className="font-bold text-gray-900">{item.quantity} un</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Price Highlight */}
              <div className="p-4 bg-emerald-700 text-white rounded-xl text-center">
                <span className="text-xs uppercase tracking-wider text-emerald-200 block font-bold">
                  VALOR TOTAL NEGOCIADO
                </span>
                <span className="text-2xl font-black block mt-0.5">
                  {formatCurrencyBRL(
                    quickViewQuote.manualNegotiatedPrice ??
                      quickViewQuote.items.reduce((acc, i) => acc + i.quantity * i.unitSale, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => onGeneratePdf(quickViewQuote, 'client')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-xs hover:bg-emerald-100 flex items-center gap-1"
                >
                  <FileDown size={14} />
                  <span>PDF Cliente</span>
                </button>
                <button
                  onClick={() => onGeneratePdf(quickViewQuote, 'internal')}
                  className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs hover:bg-slate-200 flex items-center gap-1"
                >
                  <FileDown size={14} />
                  <span>PDF Interno</span>
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const q = quickViewQuote;
                    setQuickViewQuote(null);
                    onEditQuote(q);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
                >
                  Editar Orçamento
                </button>
                <button
                  onClick={() => setQuickViewQuote(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Excluir Orçamento?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Deseja realmente excluir permanentemente o orçamento{' '}
                <strong>{deleteConfirmQuote.number} — {deleteConfirmQuote.name}</strong>?
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmQuote(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
