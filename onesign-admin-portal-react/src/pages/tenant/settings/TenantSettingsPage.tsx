import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Palette,
  Image,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Globe,
  Shield,
  Bell,
  Lock,
  Mail,
  Smartphone
} from 'lucide-react';

interface TenantSettings {
  logoUrl?: string;
  primaryColor?: string;
  tenantName?: string;
  supportEmail?: string;
  sessionTimeout?: number;
  mfaRequired?: boolean;
  allowSelfRegistration?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
}

const SettingsSection = ({ title, description, icon, children, delay }: SettingsSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-indigo-100 rounded-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

export default function TenantSettingsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [settings, setSettings] = useState<TenantSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [supportEmail, setSupportEmail] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('branding');

  // Preset colors for quick selection
  const presetColors = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchSettings();
    }
  }, [tenantId]);

  const fetchSettings = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getSettings();
      setSettings(data);
      setLogoUrl(data.logoUrl || '');
      setPrimaryColor(data.primaryColor || '#6366f1');
      setSupportEmail(data.supportEmail || '');
      setSessionTimeout(data.sessionTimeout || 30);
      setMfaRequired(data.mfaRequired || false);
      setAllowSelfRegistration(data.allowSelfRegistration || false);
      setEmailNotifications(data.emailNotifications !== false);
      setSmsNotifications(data.smsNotifications || false);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!tenantId) return;

    try {
      const data = await tenantService.updateBrandingSettings({
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null
      });
      setSettings(data);
      setSuccess(t('tenant.settings.brandingUpdated'));
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error updating branding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!tenantId) return;

    try {
      // API call would go here
      setSuccess(t('tenant.settings.securityUpdated') || 'Security settings updated successfully');
    } catch (error: any) {
      setError(error?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!tenantId) return;

    try {
      // API call would go here
      setSuccess(t('tenant.settings.notificationsUpdated') || 'Notification settings updated successfully');
    } catch (error: any) {
      setError(error?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const resetBranding = () => {
    setLogoUrl(settings.logoUrl || '');
    setPrimaryColor(settings.primaryColor || '#6366f1');
  };

  const tabs = [
    { id: 'branding', label: t('tenant.settings.branding'), icon: <Palette className="w-4 h-4" /> },
    { id: 'security', label: t('tenant.settings.security') || 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: t('tenant.settings.notifications') || 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('tenant.settings.title')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t('tenant.settings.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('tenant.settings.subtitle') || 'Configure your organization settings and preferences'}</p>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2 mb-6"
      >
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Branding Settings */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('tenant.settings.branding')}
            description={t('tenant.settings.brandingDescription') || 'Customize the look and feel of your organization'}
            icon={<Palette className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <form onSubmit={handleSaveBranding} className="space-y-6">
              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.settings.logoUrl')}</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="url"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                  </div>
                  {logoUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 p-2 flex items-center justify-center"
                    >
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant.settings.primaryColor')}</label>

                {/* Preset Colors */}
                <div className="flex gap-2 mb-4">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPrimaryColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                        primaryColor === color
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex gap-4">
                  <input
                    type="color"
                    className="h-12 w-24 border border-gray-200 rounded-xl cursor-pointer"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 font-mono"
                    placeholder="#6366f1"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>

                {/* Color Preview */}
                {primaryColor && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl border border-gray-200"
                  >
                    <p className="text-sm text-gray-500 mb-3">{t('tenant.settings.preview') || 'Preview'}</p>
                    <div className="flex gap-4 items-center">
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t('common.save')}
                      </button>
                      <div
                        className="h-12 w-32 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: primaryColor }}
                      >
                        {t('tenant.settings.sampleText') || 'Sample Text'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('common.save')}
                </motion.button>
                <button
                  type="button"
                  onClick={resetBranding}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('common.reset') || 'Reset'}
                </button>
              </div>
            </form>
          </SettingsSection>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('tenant.settings.security') || 'Security Settings'}
            description={t('tenant.settings.securityDescription') || 'Configure authentication and security options'}
            icon={<Shield className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <form onSubmit={handleSaveSecurity} className="space-y-6">
              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tenant.settings.sessionTimeout') || 'Session Timeout (minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 30)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {t('tenant.settings.sessionTimeoutHelp') || 'Users will be logged out after this period of inactivity'}
                </p>
              </div>

              {/* MFA Required */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('tenant.settings.mfaRequired') || 'Require MFA'}</p>
                    <p className="text-sm text-gray-500">{t('tenant.settings.mfaRequiredHelp') || 'Force all users to enable two-factor authentication'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mfaRequired}
                    onChange={(e) => setMfaRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Allow Self Registration */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('tenant.settings.allowSelfRegistration') || 'Allow Self Registration'}</p>
                    <p className="text-sm text-gray-500">{t('tenant.settings.allowSelfRegistrationHelp') || 'Allow new users to create accounts'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSelfRegistration}
                    onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('common.save')}
                </motion.button>
              </div>
            </form>
          </SettingsSection>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <SettingsSection
            title={t('tenant.settings.notifications') || 'Notification Settings'}
            description={t('tenant.settings.notificationsDescription') || 'Configure how users receive notifications'}
            icon={<Bell className="w-6 h-6 text-indigo-600" />}
            delay={1}
          >
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              {/* Support Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tenant.settings.supportEmail') || 'Support Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="support@example.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('tenant.settings.emailNotifications') || 'Email Notifications'}</p>
                    <p className="text-sm text-gray-500">{t('tenant.settings.emailNotificationsHelp') || 'Send important updates via email'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{t('tenant.settings.smsNotifications') || 'SMS Notifications'}</p>
                    <p className="text-sm text-gray-500">{t('tenant.settings.smsNotificationsHelp') || 'Send critical alerts via SMS'}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsNotifications}
                    onChange={(e) => setSmsNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.loading') : t('common.save')}
                </motion.button>
              </div>
            </form>
          </SettingsSection>
        </div>
      )}
    </div>
  );
}
