import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanySettings, Quote } from '../types';
import { calculateQuoteFinancials, formatCurrencyBRL, formatDateBR } from '../utils/calculator';
import { LOGO_BASE64 } from '../assets/logoData';

// Helper to sanitize filename
function sanitizeForFilename(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export interface PDFGenerationOptions {
  includePhotos?: boolean;
}

// -------------------------------------------------------------
// 1. PDF INTERNO — CONTROLE ADMINISTRATIVO (CONFIDENCIAL)
// -------------------------------------------------------------
export function generateInternalQuotePDF(
  quote: Quote,
  settings: CompanySettings,
  options: PDFGenerationOptions = {}
): { doc: jsPDF; filename: string; blobUrl: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  const financials = calculateQuoteFinancials({
    items: quote.items,
    additionalCosts: quote.additionalCosts,
    execution: quote.execution,
    commercialSurcharge: quote.commercialSurcharge,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    manualNegotiatedPrice: quote.manualNegotiatedPrice,
  });

  // Confidential Top Banner
  doc.setFillColor(220, 38, 38); // Red
  doc.rect(margin, cursorY, pageWidth - margin * 2, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DOCUMENTO INTERNO — CONFIDENCIAL (USO EXCLUSIVO BIG ART FOGOS)', pageWidth / 2, cursorY + 4.8, {
    align: 'center',
  });
  cursorY += 10;

  // Header: Logo & Company Info
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, cursorY, 38, 20);
  } catch (err) {
    console.warn('Could not add logo to PDF:', err);
  }

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(settings.commercialName || 'BIG ART FOGOS', margin + 42, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const companyLines = [
    settings.institutionalDescription,
    settings.address,
    `Telefones: ${settings.phonePrimary} / ${settings.phoneSecondary}  |  Instagram: ${settings.instagram}`,
  ];
  let compY = cursorY + 10;
  companyLines.forEach((line) => {
    if (line) {
      doc.text(line, margin + 42, compY, { maxWidth: pageWidth - margin * 2 - 44 });
      compY += 3.8;
    }
  });

  cursorY = Math.max(cursorY + 23, compY + 2);

  // Line divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  // Quote Metadata Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(16, 100, 50); // Emerald/Green
  doc.text(`ORÇAMENTO: ${quote.number}`, margin + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Nome: ${quote.name}`, margin + 4, cursorY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Emissão: ${formatDateBR(quote.createdAt)}`, pageWidth - margin - 60, cursorY + 5.5);
  doc.text(`Validade: ${formatDateBR(quote.validUntil)}`, pageWidth - margin - 60, cursorY + 10.5);

  const statusColor = quote.status === 'Aprovado' ? [22, 163, 74] : quote.status === 'Cancelado' ? [220, 38, 38] : [59, 130, 246];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${quote.status.toUpperCase()}`, pageWidth - margin - 22, cursorY + 8, { align: 'right' });

  cursorY += 18;

  // Client and Event 2-column info
  const colWidth = (pageWidth - margin * 2 - 4) / 2;

  // Client Box
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, cursorY, colWidth, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, cursorY, colWidth, 26, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 100, 50);
  doc.text('DADOS DO CLIENTE', margin + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`Cliente: ${quote.client.name || 'Não informado'}`, margin + 3, cursorY + 10);
  doc.text(`Responsável: ${quote.client.contactPerson || '-'}`, margin + 3, cursorY + 14);
  doc.text(`Contato: ${quote.client.phone || '-'}  |  E-mail: ${quote.client.email || '-'}`, margin + 3, cursorY + 18, { maxWidth: colWidth - 6 });
  if (quote.client.cpfCnpj) {
    doc.text(`CPF/CNPJ: ${quote.client.cpfCnpj}`, margin + 3, cursorY + 22);
  }

  // Event Box
  const col2X = margin + colWidth + 4;
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(col2X, cursorY, colWidth, 26, 1.5, 1.5, 'F');
  doc.roundedRect(col2X, cursorY, colWidth, 26, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 100, 50);
  doc.text('INFORMAÇÕES DO EVENTO', col2X + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`Evento: ${quote.event.name || 'Show / Celebração'}`, col2X + 3, cursorY + 10);
  doc.text(`Cidade / Local: ${quote.event.city || '-'} - ${quote.event.location || '-'}`, col2X + 3, cursorY + 14, { maxWidth: colWidth - 6 });
  doc.text(`Data do Evento: ${formatDateBR(quote.event.date)}  |  Horário: ${quote.event.time || '-'}`, col2X + 3, cursorY + 18);
  doc.text(`Horário Previsto Execução: ${quote.event.executionTime || '-'}`, col2X + 3, cursorY + 22);

  cursorY += 30;

  // Products Table (Internal - shows costs, sales, margins)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('RELAÇÃO DETALHADA DE PRODUTOS E MATERIAIS', margin, cursorY);
  cursorY += 3;

  const productRows = quote.items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const uCost = Number(item.unitCost) || 0;
    const tCost = qty * uCost;
    const uSale = Number(item.unitSale) || 0;
    const tSale = qty * uSale;
    return [
      item.productCode || '-',
      `${item.productName}\n${item.description || ''}`,
      qty.toString(),
      formatCurrencyBRL(uCost),
      formatCurrencyBRL(tCost),
      formatCurrencyBRL(uSale),
      formatCurrencyBRL(tSale),
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['Código', 'Produto / Descrição', 'Qtd', 'Custo Unit.', 'Custo Total', 'Venda Unit.', 'Venda Total']],
    body: productRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 30, 30],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
    },
    foot: [
      [
        { content: 'SUBTOTAIS DOS PRODUTOS:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: '-', styles: { halign: 'center' } },
        { content: formatCurrencyBRL(financials.productsTotalCost), styles: { halign: 'right', fontStyle: 'bold' } },
        { content: '-', styles: { halign: 'center' } },
        { content: formatCurrencyBRL(financials.productsTotalSale), styles: { halign: 'right', fontStyle: 'bold' } },
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 8,
    },
    margin: { left: margin, right: margin },
  });

  // Get Y position after autoTable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need page break for additional costs and execution
  if (cursorY > pageHeight - 75) {
    doc.addPage();
    cursorY = margin + 5;
  }

  // Additional Costs Table
  if (quote.additionalCosts && quote.additionalCosts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text('CUSTOS OPERACIONAIS ADICIONAIS (CONFIDENCIAIS)', margin, cursorY);
    cursorY += 3;

    const costRows = quote.additionalCosts.map((c) => [c.description || 'Despesa operacional', formatCurrencyBRL(Number(c.cost) || 0)]);

    autoTable(doc, {
      startY: cursorY,
      head: [['Descrição da Despesa / Logística', 'Valor de Custo']],
      body: costRows,
      theme: 'grid',
      headStyles: {
        fillColor: [100, 116, 139],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.8,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35, halign: 'right' },
      },
      foot: [
        [
          { content: 'TOTAL CUSTOS ADICIONAIS:', styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatCurrencyBRL(financials.additionalCostsTotal), styles: { halign: 'right', fontStyle: 'bold' } },
        ],
      ],
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
      },
      margin: { left: margin, right: margin },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cursorY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Execution Section (Internal: shows both charged and cost)
  if (cursorY > pageHeight - 65) {
    doc.addPage();
    cursorY = margin + 5;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 22, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 22, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 100, 50);
  doc.text(`EXECUÇÃO DO PROJETO: ${quote.execution.title || 'Serviço de Execução'}`, margin + 3, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(
    `Custo Interno da Execução: ${formatCurrencyBRL(financials.internalExecutionCost)}   |   Valor Cobrado pela Execução: ${formatCurrencyBRL(financials.chargedExecutionPrice)}`,
    margin + 3,
    cursorY + 9.5
  );

  if (quote.execution.description) {
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    const splitDesc = doc.splitTextToSize(quote.execution.description, pageWidth - margin * 2 - 8);
    doc.text(splitDesc, margin + 3, cursorY + 14);
  }

  cursorY += 27;

  // Financial Summary Box (CONFIDENTIAL DETAILED SUMMARY)
  if (cursorY > pageHeight - 65) {
    doc.addPage();
    cursorY = margin + 5;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 40, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 40, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('RESUMO FINANCEIRO CONSOLIDADO (USO INTERNO)', margin + 4, cursorY + 6);

  // Column 1: Costs breakdown
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  let summaryY = cursorY + 12;
  doc.text(`Custo Produtos: ${formatCurrencyBRL(financials.productsTotalCost)}`, margin + 4, summaryY);
  summaryY += 4.5;
  doc.text(`Custos Adicionais: ${formatCurrencyBRL(financials.additionalCostsTotal)}`, margin + 4, summaryY);
  summaryY += 4.5;
  doc.text(`Custo Execução: ${formatCurrencyBRL(financials.internalExecutionCost)}`, margin + 4, summaryY);
  summaryY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`CUSTO GERAL: ${formatCurrencyBRL(financials.generalCost)}`, margin + 4, summaryY);

  // Column 2: Commercial breakdown
  const midX = margin + 65;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  summaryY = cursorY + 12;
  doc.text(`Venda Produtos: ${formatCurrencyBRL(financials.productsTotalSale)}`, midX, summaryY);
  summaryY += 4.5;
  doc.text(`Cobrança Execução: ${formatCurrencyBRL(financials.chargedExecutionPrice)}`, midX, summaryY);
  summaryY += 4.5;
  doc.text(`Acréscimos / Descontos: +${formatCurrencyBRL(financials.commercialSurcharge)} / -${formatCurrencyBRL(financials.discountAmount)}`, midX, summaryY);
  summaryY += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Venda Calculada: ${formatCurrencyBRL(financials.calculatedSale)}`, midX, summaryY);

  // Column 3: Final Results & Profitability
  const rightBoxX = margin + 125;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightBoxX, cursorY + 4, pageWidth - rightBoxX - margin - 3, 32, 1.5, 1.5, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(rightBoxX, cursorY + 4, pageWidth - rightBoxX - margin - 3, 32, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(16, 100, 50);
  doc.text('VALOR FINAL NEGOCIADO', rightBoxX + 3, cursorY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 140, 60);
  doc.text(formatCurrencyBRL(financials.finalNegotiatedPrice), rightBoxX + 3, cursorY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Lucro Bruto: ${formatCurrencyBRL(financials.estimatedGrossProfit)}`, rightBoxX + 3, cursorY + 23);

  const marginStr = financials.grossMarginPercent !== null ? `${financials.grossMarginPercent.toFixed(1)}%` : 'N/A';
  doc.setTextColor(financials.estimatedGrossProfit >= 0 ? 16 : 220, financials.estimatedGrossProfit >= 0 ? 140 : 38, 50);
  doc.text(`Margem Bruta: ${marginStr}`, rightBoxX + 3, cursorY + 28);
  if (financials.isManualPriceActive) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text('*Valor negociado manualmente', rightBoxX + 3, cursorY + 32.5);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `BIG ART FOGOS  |  ${settings.address}  |  ${settings.phonePrimary}  |  Instagram: ${settings.instagram}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const clientSanitized = sanitizeForFilename(quote.client.name || 'CLIENTE');
  const numSanitized = sanitizeForFilename(quote.number || 'ORC');
  const filename = `BIGART_Orcamento_${numSanitized}_${clientSanitized}_INTERNO.pdf`;

  const blobUrl = doc.output('bloburl').toString();
  return { doc, filename, blobUrl };
}

// -------------------------------------------------------------
// 2. PDF COMERCIAL — PARA ENVIAR AO CLIENTE (PROPOSTA EXCLUSIVA)
// -------------------------------------------------------------
// INVIOLABLE RULES:
// - ONLY ONE SINGLE MONETARY VALUE DISPLAYED IN THE ENTIRE CLIENT PDF: VALOR TOTAL DO ORÇAMENTO.
// - NO individual product prices, NO unit costs, NO subtotals, NO discounts/surcharges breakdown, NO execution price breakdown.
// -------------------------------------------------------------
export function generateClientQuotePDF(
  quote: Quote,
  settings: CompanySettings,
  options: PDFGenerationOptions = {}
): { doc: jsPDF; filename: string; blobUrl: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let cursorY = margin;

  const financials = calculateQuoteFinancials({
    items: quote.items,
    additionalCosts: quote.additionalCosts,
    execution: quote.execution,
    commercialSurcharge: quote.commercialSurcharge,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    manualNegotiatedPrice: quote.manualNegotiatedPrice,
  });

  // Top Accent Bar (Green)
  doc.setFillColor(16, 140, 60); // Emerald Green
  doc.rect(0, 0, pageWidth, 4, 'F');
  cursorY += 2;

  // Header: Logo & Company Info
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, cursorY, 44, 22);
  } catch (err) {
    console.warn('Could not add logo to client PDF:', err);
  }

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(settings.commercialName || 'BIG ART FOGOS', margin + 48, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const companyLines = [
    settings.institutionalDescription,
    settings.address,
    `Telefones: ${settings.phonePrimary} / ${settings.phoneSecondary}  |  Instagram: ${settings.instagram}`,
  ];
  let compY = cursorY + 11;
  companyLines.forEach((line) => {
    if (line) {
      doc.text(line, margin + 48, compY, { maxWidth: pageWidth - margin * 2 - 50 });
      compY += 3.8;
    }
  });

  cursorY = Math.max(cursorY + 25, compY + 2);

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 6;

  // Proposal Title & Header Card
  doc.setFillColor(250, 252, 250);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 16, 2, 2, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 16, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 140, 60);
  doc.text(`PROPOSTA COMERCIAL — ORÇAMENTO ${quote.number}`, margin + 5, cursorY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(quote.name, margin + 5, cursorY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(`Data de Emissão: ${formatDateBR(quote.createdAt)}`, pageWidth - margin - 5, cursorY + 6.5, { align: 'right' });
  doc.text(`Válido até: ${formatDateBR(quote.validUntil)}`, pageWidth - margin - 5, cursorY + 12, { align: 'right' });

  cursorY += 21;

  // Client & Event Information Boxes (Side by Side)
  const colWidth = (pageWidth - margin * 2 - 4) / 2;

  // Box 1: Client
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY, colWidth, 28, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, colWidth, 28, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 140, 60);
  doc.text('DADOS DO CLIENTE', margin + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Cliente / Razão Social: ${quote.client.name || 'Cliente Especial'}`, margin + 4, cursorY + 10.5);
  if (quote.client.contactPerson) {
    doc.text(`Aos cuidados de: ${quote.client.contactPerson}`, margin + 4, cursorY + 14.5);
  }
  if (quote.client.phone) {
    doc.text(`Telefone / WhatsApp: ${quote.client.phone}`, margin + 4, cursorY + 18.5);
  }
  if (quote.client.email) {
    doc.text(`E-mail: ${quote.client.email}`, margin + 4, cursorY + 22.5);
  }

  // Box 2: Event Details
  const col2X = margin + colWidth + 4;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(col2X, cursorY, colWidth, 28, 1.5, 1.5, 'F');
  doc.roundedRect(col2X, cursorY, colWidth, 28, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(16, 140, 60);
  doc.text('DADOS DO EVENTO', col2X + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(`Evento: ${quote.event.name || 'Apresentação Pirotécnica'}`, col2X + 4, cursorY + 10.5);
  doc.text(`Cidade / Local: ${quote.event.city || '-'} - ${quote.event.location || '-'}`, col2X + 4, cursorY + 14.5, { maxWidth: colWidth - 8 });
  doc.text(`Data: ${formatDateBR(quote.event.date)}   |   Horário Início: ${quote.event.time || '-'}`, col2X + 4, cursorY + 18.5);
  doc.text(`Previsão Horário Execução: ${quote.event.executionTime || '-'}`, col2X + 4, cursorY + 22.5);

  cursorY += 33;

  // Products Section for Client
  // RULE: ONLY Item #, Description/Name, Quantity. NO PRICES!
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text('RELAÇÃO DE PRODUTOS E EFEITOS PIROTÉCNICOS', margin, cursorY);
  cursorY += 3;

  const clientProductRows = quote.items.map((item, index) => {
    return [
      String(index + 1).padStart(2, '0'),
      `${item.productName}\n${item.description || ''}`,
      `${item.quantity} un`,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['Item', 'Especificação dos Produtos e Efeitos', 'Quantidade']],
    body: clientProductRows,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 140, 60], // Emerald brand color
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 30, 30],
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cursorY = (doc as any).lastAutoTable.finalY + 7;

  // Execution Details Section (if enabled)
  if (quote.execution && quote.execution.showDescriptionInClientPdf && quote.execution.description) {
    if (cursorY > pageHeight - 65) {
      doc.addPage();
      cursorY = margin + 5;
    }

    doc.setFillColor(250, 252, 250);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 28, 1.5, 1.5, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(margin, cursorY, pageWidth - margin * 2, 28, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(16, 140, 60);
    doc.text(`EXECUÇÃO TÉCNICA E OPERACIONAL: ${quote.execution.title || 'Show Pirotécnico'}`, margin + 4, cursorY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    const splitExec = doc.splitTextToSize(quote.execution.description, pageWidth - margin * 2 - 8);
    doc.text(splitExec, margin + 4, cursorY + 10.5);

    cursorY += 33;
  }

  // Check page break before Total Price Card and Terms
  if (cursorY > pageHeight - 65) {
    doc.addPage();
    cursorY = margin + 5;
  }

  // -------------------------------------------------------------
  // THE SINGLE MONETARY VALUE IN THE CLIENT PDF: TOTAL DO ORÇAMENTO
  // -------------------------------------------------------------
  const priceBoxHeight = 26;
  doc.setFillColor(16, 140, 60); // Emerald Green Background
  doc.roundedRect(margin, cursorY, pageWidth - margin * 2, priceBoxHeight, 2.5, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('VALOR TOTAL DO ORÇAMENTO', pageWidth / 2, cursorY + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text(formatCurrencyBRL(financials.finalNegotiatedPrice), pageWidth / 2, cursorY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(240, 253, 244);
  doc.text('Proposta comercial completa, incluindo produtos, transporte, equipe técnica e execução.', pageWidth / 2, cursorY + 22, { align: 'center' });

  cursorY += priceBoxHeight + 7;

  // Commercial Terms & Notes
  if (quote.terms || quote.notes || settings.defaultTerms) {
    if (cursorY > pageHeight - 45) {
      doc.addPage();
      cursorY = margin + 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text('CONDIÇÕES COMERCIAIS E PROCEDIMENTOS', margin, cursorY);
    cursorY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    const termsText = [
      quote.terms || settings.defaultTerms,
      quote.notes ? `Observações: ${quote.notes}` : settings.defaultNotes ? `Observações: ${settings.defaultNotes}` : '',
    ].filter(Boolean).join('\n');

    const splitTerms = doc.splitTextToSize(termsText, pageWidth - margin * 2);
    doc.text(splitTerms, margin, cursorY);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `BIG ART FOGOS  |  ${settings.address}  |  ${settings.phonePrimary}  |  Instagram: ${settings.instagram}`,
      margin,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  const clientSanitized = sanitizeForFilename(quote.client.name || 'CLIENTE');
  const numSanitized = sanitizeForFilename(quote.number || 'ORC');
  const filename = `BIGART_Orcamento_${numSanitized}_${clientSanitized}_CLIENTE.pdf`;

  const blobUrl = doc.output('bloburl').toString();
  return { doc, filename, blobUrl };
}
