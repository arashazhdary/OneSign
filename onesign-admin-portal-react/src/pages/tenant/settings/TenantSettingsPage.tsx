import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';

interface TenantSettings {
  logoUrl?: string;
  primaryColor?: string;
}

export default function TenantSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<TenantSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

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
      const data = await tenantService.getSettings(tenantId);
      setSettings(data);
      setLogoUrl(data.logoUrl || '');
      setPrimaryColor(data.primaryColor || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    if (!tenantId) return;
    
    try {
      const data = await tenantService.updateBrandingSettings(tenantId, {
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

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('tenant.settings.title')}</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('tenant.settings.branding')}</h2>
        
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('tenant.settings.logoUrl')}</label>
            <input
              type="url"
              className="w-full px-3 py-2 border rounded"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            {logoUrl && (
              <div className="mt-2">
                <img src={logoUrl} alt="Logo preview" className="h-16 object-contain" onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('tenant.settings.primaryColor')}</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="h-10 w-20 border rounded"
                value={primaryColor || '#6366f1'}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded"
                placeholder="#6366f1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
            {primaryColor && (
              <div className="mt-2">
                <div 
                  className="h-12 rounded border"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setLogoUrl(settings.logoUrl || '');
                setPrimaryColor(settings.primaryColor || '');
              }}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

