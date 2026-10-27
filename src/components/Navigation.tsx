import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FilePlus2,
  FileText,
  Boxes,
  Building2,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AuthSession } from '../services/storage';
import { CompanySettings } from '../types';

export type ActivePage =
  | 'dashboard'
  | 'products'
  | 'new-quote'
  | 'edit-quote'
  | 'quotes'
  | 'stock'
  | 'settings';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  session: AuthSession;
  settings: CompanySettings;
  onLogout: () => void;
  lowStockCount: number;
  quotesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  session,
  settings,
  onLogout,
  lowStockCount,
  quotesCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products' as ActivePage,
      label: 'Produtos e Estoque',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} baixo` : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'new-quote' as ActivePage,
      label: 'Criar Novo Orçamento',
      icon: FilePlus2,
      badge: 'Novo',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'quotes' as ActivePage,
      label: 'Orçamentos Salvos',
      icon: FileText,
      badge: quotesCount > 0 ? quotesCount : null,
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    {
      id: 'stock' as ActivePage,
      label: 'Movimentações de Estoque',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'settings' as ActivePage,
      label: 'Configurações da Empresa',
      icon: Building2,
      badge: null,
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Mobile Bar - Stretches full width across mobile */}
      <header className="lg:hidden w-full sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center space-x-2">
            <img
              src={settings.logoUrl || '/logo-bigart.png'}
              alt="Big Art Fogos"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo-bigart.png';
              }}
            />
            <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:inline">
              BIG ART FOGOS
            </span>
          </div>
        </div>

        <button
          onClick={() => handleNavClick('new-quote')}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
        >
          <FilePlus2 size={16} />
          <span>Novo Orçamento</span>
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col items-center text-center">
          <div className="w-full flex justify-end lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X size={20} />
            </button>
          </div>
          <div className="w-full flex justify-center py-1">
            <img
              src={settings.logoUrl || '/logo-bigart.png'}
              alt="Big Art Fogos"
              className="h-14 w-auto max-w-[200px] object-contain drop-shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo-bigart.png';
              }}
            />
          </div>
          <div className="mt-2 text-center">
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">
              {settings.commercialName || 'BIG ART FOGOS'}
            </h1>
            <p className="text-[11px] text-gray-500 font-medium flex items-center justify-center gap-1 mt-0.5">
              <Sparkles size={12} className="text-emerald-600" />
              Gestão de Estoque & Orçamentos
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.id ||
              (item.id === 'quotes' && activePage === 'edit-quote');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    size={19}
                    className={isActive ? 'text-white' : 'text-gray-500'}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Session and Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {session.name || 'Administrador'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {session.role || 'Acesso Gerencial'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Encerrar sessão"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div className="text-[10px] text-gray-400 text-center pt-1 border-t border-gray-200/60">
            Muzambinho - MG • Versão 2.4.0
          </div>
        </div>
      </aside>
    </>
  );
};
