import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Star,
  Trash2,
  RefreshCw,
  Plus,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Edit2,
  Check,
  Tag,
} from 'lucide-react';
import { Product } from '../types';
import {
  deleteColor,
  generateProductCode,
  getProductsCountByColor,
  getStoredCategories,
  getStoredColors,
  renameColor,
  saveCategory,
  saveColor,
} from '../services/storage';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product> & { name: string; code: string }) => void;
  initialProduct?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Colors state
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorInput, setNewColorInput] = useState('');
  const [isManagingColors, setIsManagingColors] = useState(false);
  const [colorError, setColorError] = useState<string | null>(null);
  const [editingColorName, setEditingColorName] = useState<string | null>(null);
  const [editColorNewName, setEditColorNewName] = useState('');
  const [colorToDelete, setColorToDelete] = useState<{ name: string; count: number } | null>(null);

  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [costPrice, setCostPrice] = useState<number | string>(0);
  const [salePrice, setSalePrice] = useState<number | string>(0);
  const [stockQuantity, setStockQuantity] = useState<number | string>(0);
  const [minStockQuantity, setMinStockQuantity] = useState<number | string>(5);
  const [unit, setUnit] = useState('un');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cats = getStoredCategories();
      setCategories(cats);

      const clrs = getStoredColors();
      setAvailableColors(clrs);

      if (initialProduct) {
        setCode(initialProduct.code);
        setName(initialProduct.name);
        setCategory(initialProduct.category);
        setSelectedColors(initialProduct.colors || []);
        setDescription(initialProduct.description || '');
        setVideoUrl(initialProduct.videoUrl || '');
        setCostPrice(initialProduct.costPrice);
        setSalePrice(initialProduct.salePrice);
        setStockQuantity(initialProduct.stockQuantity);
        setMinStockQuantity(initialProduct.minStockQuantity);
        setUnit(initialProduct.unit || 'un');
        setIsActive(initialProduct.isActive);
        setImages(initialProduct.images || []);
      } else {
        const defaultCat = cats[0] || 'Tortas e Baterias';
        setCode(generateProductCode(defaultCat));
        setName('');
        setCategory(defaultCat);
        setSelectedColors([]);
        setDescription('');
        setVideoUrl('');
        setCostPrice(0);
        setSalePrice(0);
        setStockQuantity(10);
        setMinStockQuantity(5);
        setUnit('un');
        setIsActive(true);
        setImages([]);
      }
      setIsAddingCategory(false);
      setCustomCategory('');
      setIsAddingColor(false);
      setNewColorInput('');
      setIsManagingColors(false);
      setColorError(null);
      setEditingColorName(null);
      setColorToDelete(null);
      setError(null);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    setCode(generateProductCode(category));
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      const updated = saveCategory(customCategory.trim());
      setCategories(updated);
      const newCat = customCategory.trim();
      setCategory(newCat);
      if (!initialProduct) {
        setCode(generateProductCode(newCat));
      }
      setCustomCategory('');
      setIsAddingCategory(false);
    }
  };

  // Color selection handlers
  const handleAddSelectedColor = (colorName: string) => {
    if (colorName && !selectedColors.includes(colorName)) {
      setSelectedColors((prev) => [...prev, colorName]);
    }
  };

  const handleRemoveSelectedColor = (colorName: string) => {
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  const handleSaveNewColor = () => {
    setColorError(null);
    const result = saveColor(newColorInput);
    if (!result.success) {
      setColorError(result.error || 'Erro ao cadastrar cor.');
      return;
    }
    setAvailableColors(result.colors);
    const addedColor = newColorInput.trim();
    if (!selectedColors.includes(addedColor)) {
      setSelectedColors((prev) => [...prev, addedColor]);
    }
    setNewColorInput('');
    setIsAddingColor(false);
  };

  // Color management handlers
  const handleStartRename = (name: string) => {
    setEditingColorName(name);
    setEditColorNewName(name);
    setColorError(null);
  };

  const handleSaveRename = (oldName: string) => {
    setColorError(null);
    const result = renameColor(oldName, editColorNewName);
    if (!result.success) {
      setColorError(result.error || 'Erro ao renomear cor.');
      return;
    }
    setAvailableColors(result.colors);
    const newNameClean = editColorNewName.trim();
    // Update selectedColors if the renamed color was selected
    setSelectedColors((prev) =>
      prev.map((c) => (c === oldName ? newNameClean : c))
    );
    setEditingColorName(null);
    setEditColorNewName('');
  };

  const handleConfirmDeleteColor = () => {
    if (!colorToDelete) return;
    const result = deleteColor(colorToDelete.name);
    setAvailableColors(result.colors);
    setSelectedColors((prev) => prev.filter((c) => c !== colorToDelete.name));
    setColorToDelete(null);
    setColorError(null);
  };

  // Image Upload handler (up to 3 photos)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      setError('Limite máximo de 3 fotos atingido.');
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      // Validate file size (< 4MB)
      if (file.size > 4 * 1024 * 1024) {
        setError('Cada foto deve ter menos de 4MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const item = prev[index];
      const without = prev.filter((_, i) => i !== index);
      return [item, ...without];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    if (!code.trim()) {
      setError('O código do produto é obrigatório.');
      return;
    }

    const costNum = Number(costPrice) || 0;
    const saleNum = Number(salePrice) || 0;
    const stockNum = Number(stockQuantity) || 0;
    const minStockNum = Number(minStockQuantity) || 0;

    if (costNum < 0 || saleNum < 0) {
      setError('Valores de custo e venda não podem ser negativos.');
      return;
    }

    onSave({
      id: initialProduct?.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: category || 'Geral',
      colors: selectedColors,
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      costPrice: costNum,
      salePrice: saleNum,
      stockQuantity: stockNum,
      minStockQuantity: minStockNum,
      unit,
      isActive,
      images,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/75">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {initialProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h2>
            <p className="text-xs text-gray-500">
              {initialProduct
                ? 'Atualize os dados e estoque deste produto'
                : 'Insira os dados técnicos, financeiros e fotos do produto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Code and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Código Único do Produto *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: BAF-TR100"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  title="Gerar código aleatório"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <RefreshCw size={14} />
                  <span>Gerar</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Categoria *
              </label>
              {!isAddingCategory ? (
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      if (!initialProduct) {
                        setCode(generateProductCode(newCat));
                      }
                    }}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    title="Adicionar nova categoria"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Nova</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="bg-emerald-600 text-white px-2.5 py-2 rounded-lg text-xs font-bold"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="bg-gray-100 text-gray-600 px-2 rounded-lg text-xs"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cores do Produto (Multiple selection, + Nova, and Management) */}
          <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Cores do Produto
                </label>
                <p className="text-[11px] text-gray-500">
                  Selecione uma ou mais cores para este produto (opcional)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setColorError(null);
                  setIsManagingColors(true);
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 bg-white border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                <SlidersHorizontal size={13} />
                <span>Gerenciar Cores</span>
              </button>
            </div>

            {colorError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>{colorError}</span>
              </div>
            )}

            {!isAddingColor ? (
              <div className="flex gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddSelectedColor(e.target.value);
                    }
                  }}
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Selecione uma cor para adicionar...</option>
                  {availableColors
                    .filter((c) => !selectedColors.includes(c))
                    .map((cor) => (
                      <option key={cor} value={cor}>
                        {cor}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingColor(true);
                    setColorError(null);
                  }}
                  title="Cadastrar nova cor no sistema"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 border border-emerald-200/60"
                >
                  <Plus size={14} />
                  <span>Nova</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveNewColor();
                    }
                  }}
                  placeholder="Nome da cor (ex: Dourado, Multicolorido)"
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNewColor}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingColor(false);
                    setNewColorInput('');
                    setColorError(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 rounded-lg text-xs font-medium"
                >
                  Voltar
                </button>
              </div>
            )}

            {/* Selected colors tag list */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[34px] p-2 bg-white border border-gray-200 rounded-lg">
              {selectedColors.length === 0 ? (
                <span className="text-xs text-gray-400 italic">
                  Nenhuma cor selecionada ainda. Escolha no menu acima.
                </span>
              ) : (
                selectedColors.map((cor) => (
                  <span
                    key={cor}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-xs font-medium"
                  >
                    <Tag size={11} className="text-emerald-600 shrink-0" />
                    <span>{cor}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedColor(cor)}
                      className="text-emerald-700 hover:text-red-600 p-0.5 rounded transition-colors"
                      title={`Remover cor ${cor}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nome do Produto / Efeito *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Torta Show Imperial 100 Tiros Colors"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Descrição Detalhada e Efeitos Pirotécnicos
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva efeitos, cores, calibre, duração, altura dos tiros e recomendações de segurança..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Link do Vídeo do Produto
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Cole aqui o link do vídeo do produto..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Valor de Custo (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                Valor de Venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full bg-white border border-emerald-400 rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Estoque Atual *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Estoque Mínimo *
              </label>
              <input
                type="number"
                min="0"
                required
                value={minStockQuantity}
                onChange={(e) => setMinStockQuantity(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Unit & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="un">Unidade (un)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="kit">Kit (kit)</option>
                <option value="tubo">Tubo / Disparo</option>
                <option value="pct">Pacote (pct)</option>
                <option value="kg">Quilo (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Situação do Cadastro
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              >
                <option value="true">Ativo (visível para orçamentos)</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          {/* Photos Section (Up to 3 Photos) */}
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-900">
                  Fotos do Produto ({images.length}/3)
                </label>
                <p className="text-[11px] text-gray-500">
                  A primeira foto será a principal exibida nos orçamentos e listagens.
                </p>
              </div>

              {images.length < 3 && (
                <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors">
                  <Upload size={14} />
                  <span>Enviar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={false}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {images.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
                <ImageIcon size={32} className="mx-auto text-gray-300 mb-1" />
                <p className="text-xs text-gray-500">Nenhuma foto adicionada ainda.</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Clique em &quot;Enviar Foto&quot; para fazer upload do celular ou computador.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square flex items-center justify-center"
                  >
                    <img
                      src={imgUrl}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Star size={10} className="fill-white" /> Principal
                      </span>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewZoomImage(imgUrl)}
                        title="Ampliar foto"
                        className="p-1.5 bg-white text-gray-800 rounded-md hover:bg-gray-100"
                      >
                        <Eye size={14} />
                      </button>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          title="Definir como foto principal"
                          className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                        >
                          <Star size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Remover foto"
                        className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              {initialProduct ? 'Salvar Alterações' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-xl overflow-hidden p-2">
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
            >
              <X size={20} />
            </button>
            <img
              src={previewZoomImage}
              alt="Ampliação"
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Gerenciar Cores Modal */}
      {isManagingColors && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-emerald-700" />
                  <span>Gerenciar Cores dos Produtos</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cadastre novas cores, renomeie ou exclua cores existentes
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsManagingColors(false);
                  setEditingColorName(null);
                  setColorError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {colorError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{colorError}</span>
                </div>
              )}

              {/* Add new color input */}
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cadastrar Nova Cor
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewColor();
                      }
                    }}
                    placeholder="Nome da cor (ex: Violeta, Dourado Especial)"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewColor}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Registered Colors List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">
                    Cores Cadastradas ({availableColors.length})
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Clique no lápis para renomear ou na lixeira para excluir
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white max-h-64 overflow-y-auto">
                  {availableColors.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      Nenhuma cor cadastrada no sistema.
                    </div>
                  ) : (
                    availableColors.map((cor) => {
                      const count = getProductsCountByColor(cor);
                      const isEditing = editingColorName === cor;

                      return (
                        <div
                          key={cor}
                          className="px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50/80 transition-colors"
                        >
                          {isEditing ? (
                            <div className="flex-1 flex gap-2 items-center">
                              <input
                                type="text"
                                value={editColorNewName}
                                onChange={(e) => setEditColorNewName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveRename(cor);
                                  } else if (e.key === 'Escape') {
                                    setEditingColorName(null);
                                  }
                                }}
                                autoFocus
                                className="flex-1 bg-white border border-emerald-500 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(cor)}
                                className="bg-emerald-600 text-white p-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700"
                                title="Salvar alteração"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingColorName(null)}
                                className="bg-gray-200 text-gray-600 p-1.5 rounded-lg text-xs hover:bg-gray-300"
                                title="Cancelar"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-semibold text-gray-800 truncate">
                                  {cor}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    count > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {count} {count === 1 ? 'produto' : 'produtos'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartRename(cor)}
                                  title={`Renomear cor ${cor}`}
                                  className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setColorToDelete({
                                      name: cor,
                                      count,
                                    })
                                  }
                                  title={`Excluir cor ${cor}`}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManagingColors(false);
                  setEditingColorName(null);
                  setColorError(null);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Color Confirmation Dialog */}
      {colorToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Excluir Cor Cadastrada?
                </h4>
                <p className="text-xs text-gray-500">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <p>
                Deseja realmente excluir a cor{' '}
                <strong className="font-bold">"{colorToDelete.name}"</strong>?
              </p>
              {colorToDelete.count > 0 ? (
                <p className="text-[11px] text-amber-800">
                  Atenção: Esta cor está vinculada a{' '}
                  <strong>{colorToDelete.count} produto(s)</strong>. Ao confirmar,
                  a cor será apenas desvinculada desses produtos — nenhum produto
                  será excluído.
                </p>
              ) : (
                <p className="text-[11px] text-gray-500">
                  Nenhum produto cadastrado utiliza esta cor atualmente.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setColorToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteColor}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                Sim, Excluir Cor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
