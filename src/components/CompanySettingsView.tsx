import React, { useState } from 'react';
import {
  Building2,
  Save,
  RotateCcw,
  Upload,
  CheckCircle2,
  FileText,
  Phone,
  Instagram,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CompanySettings } from '../types';
import { INITIAL_COMPANY_SETTINGS } from '../data/seedData';

interface CompanySettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [commercialName, setCommercialName] = useState(settings.commercialName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [address, setAddress] = useState(settings.address);
  const [phonePrimary, setPhonePrimary] = useState(settings.phonePrimary);
  const [phoneSecondary, setPhoneSecondary] = useState(settings.phoneSecondary);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl);
  const [institutionalDescription, setInstitutionalDescription] = useState(
    settings.institutionalDescription
  );
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes);
  const [defaultTerms, setDefaultTerms] = useState(settings.defaultTerms);
  const [defaultExecutionDescription, setDefaultExecutionDescription] = useState(
    settings.defaultExecutionDescription
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRestoreDefaults = () => {
    setCommercialName(INITIAL_COMPANY_SETTINGS.commercialName);
    setLogoUrl(INITIAL_COMPANY_SETTINGS.logoUrl);
    setAddress(INITIAL_COMPANY_SETTINGS.address);
    setPhonePrimary(INITIAL_COMPANY_SETTINGS.phonePrimary);
    setPhoneSecondary(INITIAL_COMPANY_SETTINGS.phoneSecondary);
    setInstagram(INITIAL_COMPANY_SETTINGS.instagram);
    setInstagramUrl(INITIAL_COMPANY_SETTINGS.instagramUrl);
    setInstitutionalDescription(INITIAL_COMPANY_SETTINGS.institutionalDescription);
    setDefaultNotes(INITIAL_COMPANY_SETTINGS.defaultNotes);
    setDefaultTerms(INITIAL_COMPANY_SETTINGS.defaultTerms);
    setDefaultExecutionDescription(INITIAL_COMPANY_SETTINGS.defaultExecutionDescription);

    onSaveSettings(INITIAL_COMPANY_SETTINGS);
    setSuccessMsg('Dados originais oficiais da BIG ART FOGOS restaurados com sucesso!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanySettings = {
      commercialName: commercialName.trim(),
      logoUrl: logoUrl.trim(),
      address: address.trim(),
      phonePrimary: phonePrimary.trim(),
      phoneSecondary: phoneSecondary.trim(),
      instagram: instagram.trim(),
      instagramUrl: instagramUrl.trim(),
      institutionalDescription: institutionalDescription.trim(),
      defaultNotes: defaultNotes.trim(),
      defaultTerms: defaultTerms.trim(),
      defaultExecutionDescription: defaultExecutionDescription.trim(),
    };

    onSaveSettings(updated);
    setSuccessMsg('Configurações da empresa salvas com sucesso! Novos PDFs utilizarão esses dados.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Configurações da Empresa
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Dados institucionais, logotipo e cláusulas padrão utilizados nos cabeçalhos e rodapés dos PDFs
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-colors shrink-0"
        >
          <RotateCcw size={14} />
          <span>Restaurar Dados Oficiais</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Card & Logo */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={18} className="text-emerald-600" />
            <span>Identidade Visual & Logotipo</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Logo Preview */}
            <div className="md:col-span-4 flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[11px] font-bold text-gray-500 uppercase mb-2">
                Pré-visualização do Logo
              </span>
              <div className="h-20 w-full flex items-center justify-center p-2 bg-white rounded-lg border border-gray-200 shadow-2xs">
                <img
                  src={logoUrl || '/logo-bigart.png'}
                  alt="Logo Big Art Fogos"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-bigart.png';
                  }}
                />
              </div>

              <label className="mt-3 cursor-pointer bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs">
                <Upload size={14} />
                <span>Enviar Novo Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inputs */}
            <div className="md:col-span-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nome Comercial da Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={commercialName}
                  onChange={(e) => setCommercialName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  URL da Imagem da Logo Oficial
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Descrição Institucional Resumida
                </label>
                <textarea
                  rows={2}
                  value={institutionalDescription}
                  onChange={(e) => setInstitutionalDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Address */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Phone size={18} className="text-emerald-600" />
            <span>Endereço e Contatos Oficiais</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Endereço Completo (Cabeçalho e Rodapé dos PDFs)
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Telefone / WhatsApp Principal
              </label>
              <input
                type="text"
                value={phonePrimary}
                onChange={(e) => setPhonePrimary(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Telefone Secundário
              </label>
              <input
                type="text"
                value={phoneSecondary}
                onChange={(e) => setPhoneSecondary(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Instagram Oficial (@usuario)
              </label>
              <div className="relative">
                <Instagram size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Link Completo do Perfil Instagram
              </label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Default Conditions & Notes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            <span>Textos e Condições Padrão para Novos Orçamentos</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Condições Comerciais e Formas de Pagamento Padrão
              </label>
              <textarea
                rows={3}
                value={defaultTerms}
                onChange={(e) => setDefaultTerms(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Observações Institucionais e Validade Padrão
              </label>
              <textarea
                rows={2}
                value={defaultNotes}
                onChange={(e) => setDefaultNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Texto Padrão de Execução Técnica (Blaster e Procedimentos)
              </label>
              <textarea
                rows={4}
                value={defaultExecutionDescription}
                onChange={(e) => setDefaultExecutionDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
          >
            <Save size={18} />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
