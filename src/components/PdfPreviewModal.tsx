import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Eye,
  FileCode,
} from 'lucide-react';
import { CompanySettings, Quote } from '../types';
import { calculateQuoteFinancials, formatCurrencyBRL, formatDateBR } from '../utils/calculator';
import { generateClientQuotePDF, generateInternalQuotePDF } from '../services/pdfGenerator';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  settings: CompanySettings;
  initialType?: 'internal' | 'client';
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  quote,
  settings,
  initialType = 'client',
}) => {
  const [pdfType, setPdfType] = useState<'internal' | 'client'>(initialType);
  const [viewMode, setViewMode] = useState<'formatted' | 'iframe'>('formatted');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>('');

  useEffect(() => {
    if (isOpen && quote) {
      setPdfType(initialType);
      generateAndSetPdf(initialType);
    }
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, quote, initialType]);

  const generateAndSetPdf = (type: 'internal' | 'client') => {
    if (!quote) return;
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    if (type === 'internal') {
      const result = generateInternalQuotePDF(quote, settings);
      setBlobUrl(result.blobUrl);
      setFilename(result.filename);
    } else {
      const result = generateClientQuotePDF(quote, settings);
      setBlobUrl(result.blobUrl);
      setFilename(result.filename);
    }
  };

  const handleSwitchType = (type: 'internal' | 'client') => {
    setPdfType(type);
    generateAndSetPdf(type);
  };

  const handleDownload = () => {
    if (!blobUrl || !filename) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (viewMode === 'iframe' && blobUrl) {
      const iframe = document.getElementById('pdf-preview-frame') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.print();
        return;
      }
    }
    window.print();
  };

  if (!isOpen || !quote) return null;

  const financials = calculateQuoteFinancials({
    items: quote.items,
    additionalCosts: quote.additionalCosts,
    execution: quote.execution,
    commercialSurcharge: quote.commercialSurcharge,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    manualNegotiatedPrice: quote.manualNegotiatedPrice,
  });

  return (
    <div className="fixed inset-0 z-60 overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                pdfType === 'client'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {pdfType === 'client' ? <FileText size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {pdfType === 'client'
                    ? 'Proposta Comercial para o Cliente'
                    : 'Controle Administrativo Confidencial'}
                </h3>
                <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                  {quote.number}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-md">
                {pdfType === 'client'
                  ? 'Apenas o valor final total é exibido ao cliente — sem custos individuais'
                  : 'Exibe custos de produtos, despesas adicionais, execução e lucro'}
              </p>
            </div>
          </div>

          {/* Controls: Type switch, View mode, Download, Close */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Model Type Selector */}
            <div className="bg-gray-200/80 p-0.5 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => handleSwitchType('client')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pdfType === 'client'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Modelo Cliente
              </button>
              <button
                type="button"
                onClick={() => handleSwitchType('internal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pdfType === 'internal'
                    ? 'bg-white text-red-700 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Modelo Interno
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-gray-100 p-0.5 rounded-xl hidden sm:flex items-center border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('formatted')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'formatted' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
                }`}
              >
                <Eye size={13} />
                <span>Formatado</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('iframe')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  viewMode === 'iframe' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'
                }`}
              >
                <FileCode size={13} />
                <span>PDF Iframe</span>
              </button>
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              title="Imprimir documento"
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Printer size={16} />
            </button>

            {/* Direct Download */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download size={15} />
              <span>Baixar PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-3 sm:p-6 flex justify-center">
          {viewMode === 'formatted' ? (
            /* High-Fidelity A4 In-Modal Visual Document */
            <div className="bg-white w-full max-w-3xl min-h-[900px] shadow-lg rounded-xl border border-gray-200 p-8 flex flex-col justify-between text-gray-900 space-y-6">
              <div className="space-y-6">
                {/* Confidential Banner (only for internal model) */}
                {pdfType === 'internal' && (
                  <div className="bg-red-600 text-white text-center py-1.5 px-4 rounded text-xs font-bold uppercase tracking-wider">
                    DOCUMENTO INTERNO — CONFIDENCIAL (USO EXCLUSIVO BIG ART FOGOS)
                  </div>
                )}

                {/* Company Header */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-5">
                  <div className="flex items-center space-x-4">
                    <img
                      src={settings.logoUrl || '/logo-bigart.png'}
                      alt="Big Art Fogos"
                      className="h-14 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo-bigart.png';
                      }}
                    />
                    <div>
                      <h1 className="text-xl font-black text-gray-900 tracking-tight">
                        {settings.commercialName || 'BIG ART FOGOS'}
                      </h1>
                      <p className="text-xs text-gray-500 max-w-md">
                        {settings.institutionalDescription}
                      </p>
                      <div className="text-[11px] text-gray-500 mt-1">
                        {settings.address} • {settings.phonePrimary} / {settings.phoneSecondary}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proposal Title Card */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      ORÇAMENTO: {quote.number}
                    </span>
                    <h2 className="text-base font-bold text-gray-900 mt-1">{quote.name}</h2>
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <div>Emissão: <strong>{formatDateBR(quote.createdAt)}</strong></div>
                    <div>Validade: <strong>{formatDateBR(quote.validUntil)}</strong></div>
                  </div>
                </div>

                {/* Client and Event Info Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1">
                    <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                      Dados do Cliente
                    </div>
                    <div><strong>Cliente:</strong> {quote.client.name || 'Não informado'}</div>
                    {quote.client.contactPerson && <div><strong>Contato:</strong> {quote.client.contactPerson}</div>}
                    <div><strong>Telefone:</strong> {quote.client.phone || '-'}</div>
                    {quote.client.email && <div><strong>E-mail:</strong> {quote.client.email}</div>}
                    {quote.client.cpfCnpj && <div><strong>CPF/CNPJ:</strong> {quote.client.cpfCnpj}</div>}
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1">
                    <div className="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">
                      Dados do Evento
                    </div>
                    <div><strong>Evento:</strong> {quote.event.name || 'Show Pirotécnico'}</div>
                    <div><strong>Cidade / Local:</strong> {quote.event.city || '-'} - {quote.event.location || '-'}</div>
                    <div><strong>Data:</strong> {formatDateBR(quote.event.date)} às {quote.event.time || '-'}</div>
                    <div><strong>Horário Disparo:</strong> {quote.event.executionTime || '-'}</div>
                  </div>
                </div>

                {/* Products Table */}
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-2">
                    Relação de Produtos e Efeitos Pirotécnicos
                  </h3>

                  {pdfType === 'client' ? (
                    /* CLIENT TABLE: STRICTLY ONLY Name/Description and Quantity. NO PRICES! */
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-emerald-700 text-white font-bold uppercase text-[11px]">
                          <tr>
                            <th className="p-3 text-center w-12">Item</th>
                            <th className="p-3">Especificação dos Produtos e Efeitos</th>
                            <th className="p-3 text-center w-28">Quantidade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {quote.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="p-3 text-center font-bold text-gray-500">{String(idx + 1).padStart(2, '0')}</td>
                              <td className="p-3">
                                <div className="font-bold text-gray-900">{item.productName}</div>
                                {item.description && (
                                  <div className="text-gray-500 mt-0.5 text-[11px]">{item.description}</div>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-gray-900">{item.quantity} un</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* INTERNAL TABLE: Shows code, descriptions, unit costs, total costs, unit sale, total sale */
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-2 text-center">Código</th>
                            <th className="p-2">Produto / Descrição</th>
                            <th className="p-2 text-center">Qtd</th>
                            <th className="p-2 text-right">Custo Unit</th>
                            <th className="p-2 text-right">Custo Total</th>
                            <th className="p-2 text-right">Venda Unit</th>
                            <th className="p-2 text-right">Venda Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[11px]">
                          {quote.items.map((item) => (
                            <tr key={item.id}>
                              <td className="p-2 text-center font-mono font-bold">{item.productCode}</td>
                              <td className="p-2">
                                <div className="font-bold text-gray-900">{item.productName}</div>
                                <div className="text-gray-500 text-[10px]">{item.description}</div>
                              </td>
                              <td className="p-2 text-center font-bold">{item.quantity}</td>
                              <td className="p-2 text-right">{formatCurrencyBRL(item.unitCost)}</td>
                              <td className="p-2 text-right font-medium">{formatCurrencyBRL(item.quantity * item.unitCost)}</td>
                              <td className="p-2 text-right">{formatCurrencyBRL(item.unitSale)}</td>
                              <td className="p-2 text-right font-bold text-emerald-800">{formatCurrencyBRL(item.quantity * item.unitSale)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold text-[11px]">
                          <tr>
                            <td colSpan={3} className="p-2 text-right">SUBTOTAIS:</td>
                            <td>-</td>
                            <td className="p-2 text-right">{formatCurrencyBRL(financials.productsTotalCost)}</td>
                            <td>-</td>
                            <td className="p-2 text-right text-emerald-900">{formatCurrencyBRL(financials.productsTotalSale)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Execution Details */}
                {quote.execution && quote.execution.description && (pdfType === 'internal' || quote.execution.showDescriptionInClientPdf) && (
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-800 text-sm">
                      {quote.execution.title || 'Execução do Projeto'}
                    </div>
                    {pdfType === 'internal' && (
                      <div className="text-gray-700 font-medium py-1">
                        Custo Interno Execução: <strong>{formatCurrencyBRL(financials.internalExecutionCost)}</strong> | Valor Cobrado Execução: <strong className="text-emerald-800">{formatCurrencyBRL(financials.chargedExecutionPrice)}</strong>
                      </div>
                    )}
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed text-[11px]">
                      {quote.execution.description}
                    </p>
                  </div>
                )}

                {/* Additional costs (INTERNAL ONLY) */}
                {pdfType === 'internal' && quote.additionalCosts && quote.additionalCosts.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-gray-900">Custos Operacionais Adicionais (Confidencial):</div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 text-gray-700 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2">Descrição</th>
                            <th className="p-2 text-right">Valor de Custo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {quote.additionalCosts.map((c) => (
                            <tr key={c.id}>
                              <td className="p-2">{c.description}</td>
                              <td className="p-2 text-right font-medium">{formatCurrencyBRL(c.cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Financial Box */}
                {pdfType === 'client' ? (
                  /* CLIENT PROPOSAL: THE ONLY SINGLE MONETARY VALUE */
                  <div className="p-6 bg-emerald-700 text-white rounded-2xl text-center space-y-1 shadow-xs">
                    <span className="text-xs uppercase tracking-widest text-emerald-100 font-bold">
                      VALOR TOTAL DO ORÇAMENTO
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {formatCurrencyBRL(financials.finalNegotiatedPrice)}
                    </div>
                    <p className="text-xs text-emerald-100 pt-1">
                      Proposta comercial completa, incluindo produtos, transporte, equipe técnica e execução.
                    </p>
                  </div>
                ) : (
                  /* INTERNAL CONSOLIDATED SUMMARY */
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="font-bold text-gray-700 mb-1">Custos Gerais:</div>
                      <div>Custo Produtos: {formatCurrencyBRL(financials.productsTotalCost)}</div>
                      <div>Custos Adicionais: {formatCurrencyBRL(financials.additionalCostsTotal)}</div>
                      <div>Custo Execução: {formatCurrencyBRL(financials.internalExecutionCost)}</div>
                      <div className="font-bold text-red-700 mt-1">CUSTO TOTAL: {formatCurrencyBRL(financials.generalCost)}</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-700 mb-1">Valores Comerciais:</div>
                      <div>Venda Produtos: {formatCurrencyBRL(financials.productsTotalSale)}</div>
                      <div>Cobrança Execução: {formatCurrencyBRL(financials.chargedExecutionPrice)}</div>
                      <div>Acréscimos / Descontos: +{formatCurrencyBRL(financials.commercialSurcharge)} / -{formatCurrencyBRL(financials.discountAmount)}</div>
                      <div className="font-bold text-gray-900 mt-1">Venda Calculada: {formatCurrencyBRL(financials.calculatedSale)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-300">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Valor Final Negociado</div>
                      <div className="text-xl font-black text-emerald-800">{formatCurrencyBRL(financials.finalNegotiatedPrice)}</div>
                      <div className="font-bold text-gray-800 mt-1">Lucro Bruto: {formatCurrencyBRL(financials.estimatedGrossProfit)}</div>
                      <div className="font-bold text-emerald-700">
                        Margem: {financials.grossMarginPercent !== null ? `${financials.grossMarginPercent.toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and conditions */}
                {(quote.terms || settings.defaultTerms) && (
                  <div className="text-xs text-gray-600 border-t border-gray-100 pt-3 space-y-1">
                    <div className="font-bold text-gray-800">Condições Comerciais:</div>
                    <p className="whitespace-pre-line leading-relaxed text-[11px]">
                      {quote.terms || settings.defaultTerms}
                    </p>
                    {quote.notes && (
                      <p className="text-gray-500 italic text-[11px]">
                        Observações: {quote.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Document Footer */}
              <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 gap-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={settings.logoUrl || '/logo-bigart.png'}
                    alt=""
                    className="h-5 w-auto object-contain opacity-80"
                  />
                  <span>BIG ART FOGOS • Muzambinho - MG • Instagram: {settings.instagram}</span>
                </div>
                <div>Página 1 de 1</div>
              </div>
            </div>
          ) : (
            /* PDF Iframe Mode */
            blobUrl && (
              <iframe
                id="pdf-preview-frame"
                src={`${blobUrl}#toolbar=0`}
                title="Pré-visualização do Documento PDF"
                className="w-full h-full rounded-xl shadow-lg border border-gray-300 bg-white"
              />
            )
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="truncate">
            Arquivo para download: <strong className="text-gray-800 font-mono text-[11px]">{filename}</strong>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <span>Abrir PDF em nova aba</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
