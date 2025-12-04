import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Save, Settings as SettingsIcon, Shield, Bell, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Tabs from '@/components/common/Tabs';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    systemName: 'OneSign Admin Portal',
    companyName: 'Acme Corporation',
    timezone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    language: 'en',
    twoFactorAuth: true,
    sessionTimeout: 30,
    emailNotifications: true,
    slackWebhook: '',
  });

  const handleSave = () => {
    toast.success(t('settings.settingsSaved'));
  };

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'security', label: t('settings.security'), icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: t('settings.notifications'), icon: <Bell className="w-4 h-4" /> },
    { id: 'integrations', label: t('settings.integrations'), icon: <LinkIcon className="w-4 h-4" /> },
  ];

  return (
    <>
      <Helmet>
        <title>{t('settings.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('settings.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
            {t('settings.saveSettings')}
          </Button>
        </motion.div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'general' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t('settings.systemName')}
                    value={settings.systemName}
                    onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  />
                  <Input
                    label={t('settings.companyName')}
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Dropdown
                    label={t('settings.timezone')}
                    options={[
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'Europe/London', label: 'London' },
                      { value: 'Asia/Tokyo', label: 'Tokyo' },
                      { value: 'Asia/Tehran', label: 'Tehran' },
                    ]}
                    value={settings.timezone}
                    onChange={(value) => setSettings({ ...settings, timezone: value })}
                  />
                  <Dropdown
                    label={t('settings.dateFormat')}
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                    value={settings.dateFormat}
                    onChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  />
                  <Dropdown
                    label={t('settings.timeFormat')}
                    options={[
                      { value: '24h', label: '24-hour' },
                      { value: '12h', label: '12-hour (AM/PM)' },
                    ]}
                    value={settings.timeFormat}
                    onChange={(value) => setSettings({ ...settings, timeFormat: value })}
                  />
                </div>

                <Dropdown
                  label={t('settings.language')}
                  options={[
                    { value: 'en', label: t('common.languages.english') },
                    { value: 'fa', label: t('common.languages.persian') },
                  ]}
                  value={settings.language}
                  onChange={(value) => setSettings({ ...settings, language: value })}
                />
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{t('settings.twoFactorAuth')}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {t('common.status')}: {settings.twoFactorAuth ? t('settings.enabled') : t('settings.disabled')}
                    </p>
                  </div>
                  <Button
                    variant={settings.twoFactorAuth ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                  >
                    {settings.twoFactorAuth ? t('settings.disable') : t('settings.enable')}
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('settings.sessionTimeout')}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white min-w-[80px]">
                      {settings.sessionTimeout} {t('settings.minutes')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    {t('settings.passwordPolicy')}
                  </h3>
                  <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                    <li>• Minimum 8 characters</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one number</li>
                    <li>• At least one special character</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{t('settings.emailNotifications')}</h3>
                    <p className="text-sm text-slate-500 mt-1">Receive email notifications for important events</p>
                  </div>
                  <Button
                    variant={settings.emailNotifications ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  >
                    {settings.emailNotifications ? t('settings.disable') : t('settings.enable')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'integrations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t('settings.slackIntegration')}</h3>
                  <Input
                    label="Webhook URL"
                    value={settings.slackWebhook}
                    onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">{t('settings.webhooks')}</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Configure webhooks to receive real-time notifications about system events.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
