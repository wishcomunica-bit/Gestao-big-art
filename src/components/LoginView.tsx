import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { CompanySettings } from '../types';
import { AuthSession } from '../services/storage';

interface LoginViewProps {
  settings: CompanySettings;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@bigartfogos.com.br');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate admin credentials
    if (!email.trim() || !password.trim()) {
      setError('Por favor preencha e-mail e senha.');
      return;
    }

    if (password.length < 4) {
      setError('Senha incorreta.');
      return;
    }

    const session: AuthSession = {
      isAuthenticated: true,
      email: email.trim(),
      name: email.includes('admin') ? 'Administrador Big Art' : email.split('@')[0],
      role: 'Diretor / Blaster Chefe',
    };

    onLoginSuccess(session);
  };

  const handleQuickMasterLogin = () => {
    const session: AuthSession = {
      isAuthenticated: true,
      email: 'admin@bigartfogos.com.br',
      name: 'Administrador Big Art',
      role: 'Diretor / Blaster Chefe',
    };
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img
            src={settings.logoUrl || '/logo-bigart.png'}
            alt="Big Art Fogos"
            className="h-16 w-auto max-w-[240px] object-contain drop-shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo-bigart.png';
            }}
          />
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          BIG ART FOGOS
        </h2>
        <p className="mt-1 text-xs text-gray-500 font-medium">
          Sistema de Gestão de Estoque e Orçamentos Comerciais
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200/90 rounded-2xl sm:px-10">
          <div className="mb-6 flex items-center space-x-2 text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs">
            <ShieldCheck size={18} className="shrink-0" />
            <div>
              <strong>Acesso Restrito:</strong> Área exclusiva para a equipe administrativa e blaster da Big Art Fogos.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Senha Administrativa
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleMasterLogin => handleQuickMasterLogin()}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Acesso Rápido com Perfil Diretor Blaster</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          Big Art Fogos • Muzambinho - MG • Todos os direitos reservados
        </div>
      </div>
    </div>
  );
};
