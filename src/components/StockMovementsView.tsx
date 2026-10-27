import React, { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  History,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { MovementType, Product, StockMovement } from '../types';
import { formatDateTimeBR } from '../utils/calculator';

interface StockMovementsViewProps {
  products: Product[];
  movements: StockMovement[];
  onUpdateStock: (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string
  ) => { success: boolean; error?: string };
  preselectedProduct?: Product | null;
}

export const StockMovementsView: React.FC<StockMovementsViewProps> = ({
  products,
  movements,
  onUpdateStock,
  preselectedProduct,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || (products[0]?.id ?? '')
  );
  const [movementType, setMovementType] = useState<MovementType>('ENTRADA');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedProductId) {
      setErrorMsg('Selecione um produto.');
      return;
    }

    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('A quantidade deve ser um número maior que zero.');
      return;
    }

    const result = onUpdateStock(selectedProductId, movementType, qtyNum, reason);

    if (result.success) {
      setSuccessMsg(
        `Estoque atualizado com sucesso para o produto ${selectedProduct?.name}!`
      );
      setQuantity(1);
      setReason('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(result.error || 'Falha ao registrar movimentação.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Gerenciamento e Histórico de Estoque
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Registre entradas de mercadorias, saídas operacionais e consulte o livro de movimentações
        </p>
      </div>

      {/* Grid: Movement Form + Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Nova Movimentação</h3>
              <p className="text-[11px] text-gray-500">
                Altere o saldo real do estoque no depósito
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Product */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Produto *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} (Atual: {p.stockQuantity} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Product info card */}
            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-gray-500">Saldo Atual em Estoque:</span>
                  <div className="text-base font-bold text-gray-900">
                    {selectedProduct.stockQuantity} {selectedProduct.unit}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">Estoque Mínimo Alerta:</span>
                  <div className="text-xs font-semibold text-gray-700">
                    {selectedProduct.minStockQuantity} {selectedProduct.unit}
                  </div>
                </div>
              </div>
            )}

            {/* Movement Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tipo de Operação *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('ENTRADA')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    movementType === 'ENTRADA'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDownLeft size={16} />
                  <span>Entrada (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('SAIDA')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    movementType === 'SAIDA'
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUpRight size={16} />
                  <span>Saída (-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('AJUSTE')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    movementType === 'AJUSTE'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                  <span>Ajuste / Saldo</span>
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {movementType === 'AJUSTE' ? 'Novo Saldo Contado em Depósito *' : 'Quantidade *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Reason / Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Motivo / Justificativa (Opcional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Compra de lote de fábrica, venda balcão, reposição pós-show..."
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>Confirmar Movimentação</span>
            </button>
          </form>

          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Regra de Negócio:</strong> A inclusão de produtos em orçamentos comerciais não baixa automaticamente o estoque, garantindo que propostas em negociação não alterem o estoque físico disponível.
          </div>
        </div>

        {/* History Audit Log Card */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <History size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Histórico de Movimentações</h3>
                <p className="text-[11px] text-gray-500">
                  Registro permanente de auditoria de entradas, saídas e acertos
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {movements.length} registro(s)
            </span>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto max-h-[500px]">
            {movements.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Nenhuma movimentação registrada até o momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {movements.map((mov) => {
                  const isEntrada = mov.type === 'ENTRADA';
                  const isSaida = mov.type === 'SAIDA';

                  return (
                    <div
                      key={mov.id}
                      className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isEntrada
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSaida
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isEntrada ? (
                            <ArrowDownLeft size={14} />
                          ) : isSaida ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <SlidersHorizontal size={14} />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-gray-900">
                            {mov.productName}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            Código: {mov.productCode}
                          </div>
                          {mov.reason && (
                            <div className="text-gray-600 mt-1 italic text-[11px]">
                              &quot;{mov.reason}&quot;
                            </div>
                          )}
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={10} />
                            <span>{formatDateTimeBR(mov.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold text-sm ${
                            isEntrada
                              ? 'text-emerald-700'
                              : isSaida
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {isEntrada ? `+${mov.quantity}` : isSaida ? `-${mov.quantity}` : `Saldo: ${mov.newStock}`}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {mov.previousStock} → {mov.newStock}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
