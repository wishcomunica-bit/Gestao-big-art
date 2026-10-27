import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Boxes,
  X,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrencyBRL } from '../utils/calculator';

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickStockMovement: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickStockMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'NORMAL' | 'LOW' | 'ZERO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Normalization for search (ignoring case, spaces, and accents)
  const normalize = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredProducts = useMemo(() => {
    const term = normalize(searchTerm);

    return products.filter((p) => {
      // Search term in code or name or description
      const matchesSearch =
        !term ||
        normalize(p.code).includes(term) ||
        normalize(p.name).includes(term) ||
        normalize(p.description || '').includes(term);

      // Category filter
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.isActive) ||
        (statusFilter === 'INACTIVE' && !p.isActive);

      // Stock condition filter
      let matchesStock = true;
      const stock = Number(p.stockQuantity) || 0;
      const minStock = Number(p.minStockQuantity) || 0;

      if (stockFilter === 'ZERO') {
        matchesStock = stock <= 0;
      } else if (stockFilter === 'LOW') {
        matchesStock = stock > 0 && stock <= minStock;
      } else if (stockFilter === 'NORMAL') {
        matchesStock = stock > minStock;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, statusFilter, stockFilter]);

  const confirmDelete = () => {
    if (deleteConfirmProduct) {
      onDeleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Produtos e Controle de Estoque
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastre fogos de artifício, monitore quantidades e edite valores comerciais
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors shrink-0"
        >
          <Plus size={18} />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Instant Search input */}
          <div className="md:col-span-5 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por código (BAF-...) ou nome do produto..."
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

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Condition */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todo o Estoque</option>
              <option value="LOW">Estoque Baixo</option>
              <option value="ZERO">Sem Estoque</option>
              <option value="NORMAL">Estoque Normal</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-sm bg-gray-50/60 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Apenas Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>
        </div>

        {/* Counter of results */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span>
            Exibindo <strong>{filteredProducts.length}</strong> de {products.length} produtos cadastrados
          </span>
          {(searchTerm || selectedCategory !== 'ALL' || stockFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setStockFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Boxes size={44} className="mx-auto mb-2 opacity-40" />
            <p className="text-base font-bold text-gray-700">Nenhum produto encontrado</p>
            <p className="text-xs text-gray-500 mt-1">
              Verifique os termos da pesquisa ou cadastre novos itens no estoque.
            </p>
            <button
              onClick={onOpenNewProduct}
              className="mt-4 inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-emerald-700"
            >
              <Plus size={16} />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-center">Foto</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Produto / Categoria</th>
                  <th className="px-4 py-3 text-center">Estoque</th>
                  <th className="px-4 py-3 text-right">Custo</th>
                  <th className="px-4 py-3 text-right">Preço Venda</th>
                  <th className="px-4 py-3 text-center">Situação</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const stock = Number(p.stockQuantity) || 0;
                  const minStock = Number(p.minStockQuantity) || 0;
                  const isLow = stock <= minStock && stock > 0;
                  const isZero = stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div
                          onClick={() => {
                            setViewProduct(p);
                            setSelectedPhotoIndex(0);
                          }}
                          className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center mx-auto"
                        >
                          {p.images && p.images.length > 0 ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Boxes size={20} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-900 text-xs">
                        {p.code}
                      </td>

                      {/* Product Name & Category */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-bold text-gray-900 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="font-bold text-gray-900">
                          {stock} <span className="text-xs font-normal text-gray-500">{p.unit}</span>
                        </div>
                        <div className="text-[10px] text-gray-400">Mín: {minStock}</div>
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-right whitespace-nowrap text-xs text-gray-600 font-medium">
                        {formatCurrencyBRL(p.costPrice)}
                      </td>

                      {/* Sale Price */}
                      <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-emerald-800">
                        {formatCurrencyBRL(p.salePrice)}
                      </td>

                      {/* Stock Situation */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {isZero ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <XCircle size={12} /> Sem Estoque
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} /> Estoque Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Normal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setViewProduct(p);
                              setSelectedPhotoIndex(0);
                            }}
                            title="Visualizar detalhes e fotos"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onQuickStockMovement(p)}
                            title="Movimentar estoque (+ / -)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Boxes size={16} />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            title="Editar produto"
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            title="Excluir produto"
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

      {/* Product Detail Modal (Visualizar Produto com até 3 fotos) */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {viewProduct.code}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{viewProduct.name}</h3>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Photos Gallery */}
              {viewProduct.images && viewProduct.images.length > 0 ? (
                <div className="space-y-2">
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <img
                      src={viewProduct.images[selectedPhotoIndex] || viewProduct.images[0]}
                      alt={viewProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {viewProduct.images.length > 1 && (
                    <div className="flex gap-2 justify-center">
                      {viewProduct.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoIndex(i)}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPhotoIndex === i ? 'border-emerald-600 scale-105' : 'border-gray-200 opacity-70'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 bg-gray-50 rounded-xl text-center text-gray-400 text-xs">
                  Sem fotos cadastradas para este produto.
                </div>
              )}

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500">Categoria:</span>
                  <div className="font-bold text-gray-800">{viewProduct.category}</div>
                </div>
                <div>
                  <span className="text-gray-500">Unidade de Medida:</span>
                  <div className="font-bold text-gray-800">{viewProduct.unit}</div>
                </div>
                <div>
                  <span className="text-gray-500">Valor de Custo (interno):</span>
                  <div className="font-bold text-gray-800">{formatCurrencyBRL(viewProduct.costPrice)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Preço de Venda Padrão:</span>
                  <div className="font-bold text-emerald-800 text-sm">{formatCurrencyBRL(viewProduct.salePrice)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Estoque Disponível:</span>
                  <div className="font-bold text-gray-900 text-sm">
                    {viewProduct.stockQuantity} {viewProduct.unit}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Estoque Mínimo de Alerta:</span>
                  <div className="font-bold text-gray-800">
                    {viewProduct.minStockQuantity} {viewProduct.unit}
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewProduct.description && (
                <div>
                  <span className="text-xs font-bold text-gray-700">Descrição Técnica:</span>
                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-line bg-white p-3 rounded-lg border border-gray-200">
                    {viewProduct.description}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  onEditProduct(p);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
              >
                Editar Produto
              </button>
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Excluir Produto?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tem certeza de que deseja excluir permanentemente o produto{' '}
                <strong>{deleteConfirmProduct.name}</strong> ({deleteConfirmProduct.code})? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
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
