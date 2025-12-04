import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Palette,
  Image,
  Mail,
  Globe,
  RefreshCw,
  Save,
  Eye,
  Paintbrush,
  FileText,
  CheckCircle,
  AlertCircle,
  Layout,
  Lock,
  X
} from 'lucide-react';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import Modal from '@/components/common/Modal';

interface BrandingConfig {
  logoLightUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customDomain?: string;
  emailTemplates?: EmailTemplate[];
  loginPageConfig?: LoginPageConfig;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
}

interface LoginPageConfig {
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImageUrl?: string;
  showLogo: boolean;
  title?: string;
  subtitle?: string;
}

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [];

type Tab = 'logos' | 'colors' | 'login' | 'emails' | 'domain';

export default function TenantBrandingPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>({
    loginPageConfig: {
      backgroundType: 'gradient',
      gradientStart: '#6366f1',
      gradientEnd: '#8b5cf6',
      showLogo: true,
      title: '',
      subtitle: '',
    },
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('logos');
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'login' | 'email'>('login');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchBranding();
    }
  }, [tenantId]);

  const fetchBranding = async () => {
    if (!tenantId) return;
    try {
      const data = await tenantService.getBranding();
      setBranding({ ...branding, ...data });
    } catch (error: any) {
      console.error('Error fetching branding:', error);
      setError(error?.message || t('common.failedToFetchBranding'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const data = await tenantService.updateBranding(branding);
      setBranding({ ...branding, ...data });
      setSuccess(t('tenant.branding.savedSuccessfully'));
    } catch (error: any) {
      setError(error?.message || t('common.failedToSaveBranding'));
      console.error('Error saving branding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailTemplate = () => {
    if (!selectedTemplate) return;

    setBranding({
      ...branding,
      emailTemplates: branding.emailTemplates?.map((t) =>
        t.id === selectedTemplate.id ? selectedTemplate : t
      ),
    });

    setShowEmailEditor(false);
    setSelectedTemplate(null);
    setSuccess(t('tenant.branding.emailTemplateUpdated'));
  };

  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setSelectedTemplate({ ...template });
    setShowEmailEditor(true);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'logos', label: t('tenant.branding.tabs.logos'), icon: Image },
    { id: 'colors', label: t('tenant.branding.tabs.colors'), icon: Palette },
    { id: 'login', label: t('tenant.branding.tabs.login'), icon: Layout },
    { id: 'emails', label: t('tenant.branding.tabs.emails'), icon: Mail },
    { id: 'domain', label: t('tenant.branding.tabs.domain'), icon: Globe },
  ];

  const renderLoginPreview = () => {
    const { loginPageConfig } = branding;
    if (!loginPageConfig) return null;

    let backgroundStyle: React.CSSProperties = {};

    switch (loginPageConfig.backgroundType) {
      case 'color':
        backgroundStyle.backgroundColor = loginPageConfig.backgroundColor || '#f3f4f6';
        break;
      case 'gradient':
        backgroundStyle.background = `linear-gradient(135deg, ${loginPageConfig.gradientStart || '#6366f1'}, ${loginPageConfig.gradientEnd || '#8b5cf6'})`;
        break;
      case 'image':
        if (loginPageConfig.backgroundImageUrl) {
          backgroundStyle.backgroundImage = `url(${loginPageConfig.backgroundImageUrl})`;
          backgroundStyle.backgroundSize = 'cover';
          backgroundStyle.backgroundPosition = 'center';
        }
        break;
    }

    return (
      <div
        className="w-full h-96 flex items-center justify-center rounded-xl overflow-hidden"
        style={backgroundStyle}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-96">
          {loginPageConfig.showLogo && branding.logoLightUrl && (
            <img
              src={branding.logoLightUrl}
              alt="Logo"
              className="h-12 mx-auto mb-6 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: branding.primaryColor }}>
            {loginPageConfig.title || t('tenant.branding.loginPreview.defaultTitle')}
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            {loginPageConfig.subtitle || t('tenant.branding.loginPreview.defaultSubtitle')}
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder={t('tenant.branding.loginPreview.emailPlaceholder')}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
              disabled
            />
            <input
              type="password"
              placeholder={t('tenant.branding.loginPreview.passwordPlaceholder')}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700"
              disabled
            />
            <button
              className="w-full py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
              disabled
            >
              {t('tenant.branding.loginPreview.loginButton')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailPreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-4 mb-2">
            {branding.logoLightUrl && (
              <img src={branding.logoLightUrl} alt="Logo" className="h-8 object-contain" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTemplate.subject}</h3>
        </div>
        <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{selectedTemplate.body}</div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-8 text-xs text-slate-500">
          <p>{t('tenant.branding.emailPreview.disclaimer')}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Palette className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('tenant.branding.title')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                <Paintbrush className="w-6 h-6" />
              </div>
              {t('tenant.branding.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.branding.subtitle')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPreviewMode('login');
                setShowPreview(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <Eye className="w-4 h-4" />
              {t('common.preview')}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveBranding}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? t('common.saving') : t('common.saveChanges')}
            </motion.button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2"
        >
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Logos Tab */}
          {activeTab === 'logos' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                {t('tenant.branding.logos.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.logos.logoLight')}
                  </label>
                  <input
                    type="url"
                    value={branding.logoLightUrl || ''}
                    onChange={(e) => setBranding({ ...branding, logoLightUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/logo-light.png"
                  />
                  {branding.logoLightUrl && (
                    <div className="mt-3 border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
                      <img
                        src={branding.logoLightUrl}
                        alt="Logo Light"
                        className="h-16 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.logos.logoDark')}
                  </label>
                  <input
                    type="url"
                    value={branding.logoDarkUrl || ''}
                    onChange={(e) => setBranding({ ...branding, logoDarkUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com/logo-dark.png"
                  />
                  {branding.logoDarkUrl && (
                    <div className="mt-3 border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-900">
                      <img
                        src={branding.logoDarkUrl}
                        alt="Logo Dark"
                        className="h-16 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('tenant.branding.logos.favicon')}
                </label>
                <input
                  type="url"
                  value={branding.faviconUrl || ''}
                  onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/favicon.ico"
                />
                {branding.faviconUrl && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 inline-block">
                    <img
                      src={branding.faviconUrl}
                      alt="Favicon"
                      className="h-8 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                {t('tenant.branding.colors.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.colors.primary')}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={branding.primaryColor || '#6366f1'}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="h-12 w-16 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor || '#6366f1'}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.colors.secondary')}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={branding.secondaryColor || '#8b5cf6'}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="h-12 w-16 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor || '#8b5cf6'}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.colors.accent')}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={branding.accentColor || '#10b981'}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="h-12 w-16 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.accentColor || '#10b981'}
                      onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="font-medium text-slate-900 dark:text-white mb-4">{t('tenant.branding.colors.previewTitle')}</h3>
                <div className="flex gap-4">
                  <button
                    className="px-6 py-3 rounded-xl text-white font-medium"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    {t('tenant.branding.colors.primaryButton')}
                  </button>
                  <button
                    className="px-6 py-3 rounded-xl text-white font-medium"
                    style={{ backgroundColor: branding.secondaryColor }}
                  >
                    {t('tenant.branding.colors.secondaryButton')}
                  </button>
                  <button
                    className="px-6 py-3 rounded-xl text-white font-medium"
                    style={{ backgroundColor: branding.accentColor }}
                  >
                    {t('tenant.branding.colors.accentButton')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login Tab */}
          {activeTab === 'login' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-600" />
                  {t('tenant.branding.login.title')}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.login.backgroundType')}
                  </label>
                  <select
                    value={branding.loginPageConfig?.backgroundType || 'gradient'}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        loginPageConfig: {
                          ...branding.loginPageConfig!,
                          backgroundType: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="color">{t('tenant.branding.login.backgroundTypes.color')}</option>
                    <option value="gradient">{t('tenant.branding.login.backgroundTypes.gradient')}</option>
                    <option value="image">{t('tenant.branding.login.backgroundTypes.image')}</option>
                  </select>
                </div>

                {branding.loginPageConfig?.backgroundType === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('tenant.branding.login.backgroundColor')}
                    </label>
                    <input
                      type="color"
                      value={branding.loginPageConfig.backgroundColor || '#f3f4f6'}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          loginPageConfig: {
                            ...branding.loginPageConfig!,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="w-full h-12 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer"
                    />
                  </div>
                )}

                {branding.loginPageConfig?.backgroundType === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('tenant.branding.login.gradientStart')}
                      </label>
                      <input
                        type="color"
                        value={branding.loginPageConfig.gradientStart || '#6366f1'}
                        onChange={(e) =>
                          setBranding({
                            ...branding,
                            loginPageConfig: {
                              ...branding.loginPageConfig!,
                              gradientStart: e.target.value,
                            },
                          })
                        }
                        className="w-full h-12 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('tenant.branding.login.gradientEnd')}
                      </label>
                      <input
                        type="color"
                        value={branding.loginPageConfig.gradientEnd || '#8b5cf6'}
                        onChange={(e) =>
                          setBranding({
                            ...branding,
                            loginPageConfig: {
                              ...branding.loginPageConfig!,
                              gradientEnd: e.target.value,
                            },
                          })
                        }
                        className="w-full h-12 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {branding.loginPageConfig?.backgroundType === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('tenant.branding.login.backgroundImageUrl')}
                    </label>
                    <input
                      type="url"
                      value={branding.loginPageConfig.backgroundImageUrl || ''}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          loginPageConfig: {
                            ...branding.loginPageConfig!,
                            backgroundImageUrl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="https://example.com/background.jpg"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={branding.loginPageConfig?.showLogo ?? true}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          loginPageConfig: {
                            ...branding.loginPageConfig!,
                            showLogo: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('tenant.branding.login.showLogo')}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.login.titleLabel')}
                  </label>
                  <input
                    type="text"
                    value={branding.loginPageConfig?.title || ''}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        loginPageConfig: {
                          ...branding.loginPageConfig!,
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder={t('tenant.branding.login.titlePlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('tenant.branding.login.subtitleLabel')}
                  </label>
                  <input
                    type="text"
                    value={branding.loginPageConfig?.subtitle || ''}
                    onChange={(e) =>
                      setBranding({
                        ...branding,
                        loginPageConfig: {
                          ...branding.loginPageConfig!,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder={t('tenant.branding.login.subtitlePlaceholder')}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  {t('tenant.branding.login.livePreview')}
                </h3>
                {renderLoginPreview()}
              </div>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                {t('tenant.branding.emails.title')}
              </h2>

              <div className="space-y-3">
                {branding.emailTemplates?.map((template) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">{template.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('tenant.branding.emails.subject')}: {template.subject}</p>
                        <p className="text-xs text-slate-400 mt-1">{t('tenant.branding.emails.type')}: {template.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedTemplate({ ...template });
                            setPreviewMode('email');
                            setShowPreview(true);
                          }}
                          className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          {t('common.preview')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditEmailTemplate(template)}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {t('common.edit')}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Tab */}
          {activeTab === 'domain' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                {t('tenant.branding.domain.title')}
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('tenant.branding.domain.customDomain')}
                </label>
                <input
                  type="text"
                  value={branding.customDomain || ''}
                  onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="auth.yourdomain.com"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {t('tenant.branding.domain.description')}
                </p>
              </div>

              {branding.customDomain && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('tenant.branding.domain.dnsSettings')}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                    {t('tenant.branding.domain.dnsInstructions')}
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
                    <div className="grid grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">{t('tenant.branding.domain.dnsType')}:</span>
                        <span className="mr-2 text-slate-900 dark:text-white">CNAME</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">{t('tenant.branding.domain.dnsName')}:</span>
                        <span className="mr-2 text-slate-900 dark:text-white">{branding.customDomain}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-500">{t('tenant.branding.domain.dnsValue')}:</span>
                        <span className="mr-2 text-slate-900 dark:text-white">auth.onesign.io</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Email Editor Modal */}
        <Modal
          isOpen={showEmailEditor}
          onClose={() => {
            setShowEmailEditor(false);
            setSelectedTemplate(null);
          }}
          title={t('tenant.branding.emails.editTemplate')}
          size="lg"
        >
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('tenant.branding.emails.templateName')}
                </label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('tenant.branding.emails.subject')}
                </label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('tenant.branding.emails.body')}
                </label>
                <textarea
                  value={selectedTemplate.body}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, body: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  rows={12}
                  dir="ltr"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {t('tenant.branding.emails.availableVariables')}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => {
                    setShowEmailEditor(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSaveEmailTemplate}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title={t('common.preview')}
          size="xl"
        >
          <div className="p-4">
            {previewMode === 'login' ? renderLoginPreview() : renderEmailPreview()}
          </div>
        </Modal>
      </div>
    </>
  );
}
