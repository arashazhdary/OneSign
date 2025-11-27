'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { platformService } from '@/lib/api/services/platform.service';

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

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{tenant_name}}',
    body: 'Hello {{user_name}},\n\nWelcome to our platform!\n\nBest regards,\n{{tenant_name}}',
    type: 'welcome',
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    subject: 'Password Reset Request',
    body: 'Hello {{user_name}},\n\nClick here to reset your password: {{reset_link}}\n\nBest regards,\n{{tenant_name}}',
    type: 'password-reset',
  },
  {
    id: 'invitation',
    name: 'User Invitation',
    subject: 'You have been invited to {{tenant_name}}',
    body: 'Hello,\n\nYou have been invited to join {{tenant_name}}. Click here to accept: {{invitation_link}}\n\nBest regards,\n{{tenant_name}}',
    type: 'invitation',
  },
];

export default function BrandingCustomizationPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>({
    loginPageConfig: {
      backgroundType: 'gradient',
      gradientStart: '#6366f1',
      gradientEnd: '#8b5cf6',
      showLogo: true,
      title: 'Welcome Back',
      subtitle: 'Sign in to your account',
    },
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'login' | 'email'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'logos' | 'colors' | 'login' | 'emails' | 'domain'>('logos');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchBranding();
    }
  }, [tenantId]);

  const fetchBranding = async () => {
    if (!tenantId) return;
    try {
      const data = await (platformService as any).getBranding(tenantId);
      setBranding({ ...branding, ...data });
    } catch (error: any) {
      console.error('Error fetching branding:', error);
      setError(error?.message || 'Failed to fetch branding');
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
      const data = await (platformService as any).updateBranding(tenantId, branding);
      setBranding({ ...branding, ...data });
      setSuccess('Branding saved successfully');
    } catch (error: any) {
      setError(error?.message || 'Failed to save branding');
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
    setSuccess('Email template updated');
  };

  const handleEditEmailTemplate = (template: EmailTemplate) => {
    setSelectedTemplate({ ...template });
    setShowEmailEditor(true);
  };

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
        className="w-full h-96 flex items-center justify-center rounded-lg overflow-hidden"
        style={backgroundStyle}
      >
        <div className="bg-white rounded-lg shadow-xl p-8 w-96">
          {loginPageConfig.showLogo && branding.logoLightUrl && (
            <img
              src={branding.logoLightUrl}
              alt="Logo"
              className="h-12 mx-auto mb-6 object-contain"
            />
          )}
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: branding.primaryColor }}>
            {loginPageConfig.title || 'Welcome Back'}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {loginPageConfig.subtitle || 'Sign in to your account'}
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded"
              disabled
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded"
              disabled
            />
            <button
              className="w-full py-2 rounded text-white"
              style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
              disabled
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailPreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="bg-white rounded-lg border p-8 max-w-2xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <div className="flex items-center gap-4 mb-2">
            {branding.logoLightUrl && (
              <img src={branding.logoLightUrl} alt="Logo" className="h-8 object-contain" />
            )}
          </div>
          <h3 className="text-lg font-bold">{selectedTemplate.subject}</h3>
        </div>
        <div className="whitespace-pre-wrap text-sm">{selectedTemplate.body}</div>
        <div className="border-t pt-4 mt-8 text-xs text-gray-500">
          <p>This is a preview. Variables like user_name, tenant_name will be replaced with actual values.</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Branding & Customization</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setPreviewMode('login');
              setShowPreview(true);
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            👁️ Preview
          </button>
          <button
            onClick={handleSaveBranding}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'logos', label: 'Logos & Icons', icon: '🎨' },
          { id: 'colors', label: 'Color Scheme', icon: '🌈' },
          { id: 'login', label: 'Login Page', icon: '🔐' },
          { id: 'emails', label: 'Email Templates', icon: '📧' },
          { id: 'domain', label: 'Custom Domain', icon: '🌐' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Logos & Icons Tab */}
      {activeTab === 'logos' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Logos & Icons</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Logo (Light Mode)</label>
              <input
                type="url"
                value={branding.logoLightUrl || ''}
                onChange={(e) => setBranding({ ...branding, logoLightUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="https://example.com/logo-light.png"
              />
              {branding.logoLightUrl && (
                <div className="border rounded p-4 bg-gray-50">
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
              <label className="block text-sm font-medium mb-2">Logo (Dark Mode)</label>
              <input
                type="url"
                value={branding.logoDarkUrl || ''}
                onChange={(e) => setBranding({ ...branding, logoDarkUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="https://example.com/logo-dark.png"
              />
              {branding.logoDarkUrl && (
                <div className="border rounded p-4 bg-gray-900">
                  <img
                    src={branding.logoDarkUrl}
                    alt="Logo Dark"
                    className="h-16 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Favicon</label>
              <input
                type="url"
                value={branding.faviconUrl || ''}
                onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder="https://example.com/favicon.ico"
              />
              {branding.faviconUrl && (
                <div className="border rounded p-4 bg-gray-50">
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
        </div>
      )}

      {/* Color Scheme Tab */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={branding.primaryColor || '#6366f1'}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="h-12 w-20 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor || '#6366f1'}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <div
                  className="w-32 h-12 rounded border flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: branding.primaryColor || '#6366f1' }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={branding.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="h-12 w-20 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor || '#8b5cf6'}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <div
                  className="w-32 h-12 rounded border flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: branding.secondaryColor || '#8b5cf6' }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <div className="flex gap-4">
                <input
                  type="color"
                  value={branding.accentColor || '#10b981'}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  className="h-12 w-20 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.accentColor || '#10b981'}
                  onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <div
                  className="w-32 h-12 rounded border flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: branding.accentColor || '#10b981' }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Color Preview</h3>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-4 py-2 rounded text-white"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  Accent Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Page Tab */}
      {activeTab === 'login' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Login Page Customization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Type</label>
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
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="color">Solid Color</option>
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {branding.loginPageConfig?.backgroundType === 'color' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
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
                    className="w-full h-12 border rounded cursor-pointer"
                  />
                </div>
              )}

              {branding.loginPageConfig?.backgroundType === 'gradient' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gradient Start</label>
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
                      className="w-full h-12 border rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gradient End</label>
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
                      className="w-full h-12 border rounded cursor-pointer"
                    />
                  </div>
                </>
              )}

              {branding.loginPageConfig?.backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Background Image URL</label>
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
                    className="w-full px-3 py-2 border rounded"
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
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Show Logo</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
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
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Welcome Back"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
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
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Sign in to your account"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            {renderLoginPreview()}
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Email Templates</h2>
          <div className="space-y-3">
            {branding.emailTemplates?.map((template) => (
              <div key={template.id} className="border rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">Subject: {template.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">Type: {template.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate({ ...template });
                        setPreviewMode('email');
                        setShowPreview(true);
                      }}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleEditEmailTemplate(template)}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Domain Tab */}
      {activeTab === 'domain' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Domain</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Custom Domain</label>
              <input
                type="text"
                value={branding.customDomain || ''}
                onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="auth.yourdomain.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                Configure your custom domain for login and user-facing pages.
              </p>
            </div>

            {branding.customDomain && (
              <div className="border rounded p-4 bg-blue-50">
                <h3 className="font-medium mb-2">DNS Configuration</h3>
                <p className="text-sm mb-2">Add the following DNS records to your domain:</p>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <div className="mb-1">
                    <span className="text-gray-600">Type:</span> CNAME
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-600">Name:</span> {branding.customDomain}
                  </div>
                  <div>
                    <span className="text-gray-600">Value:</span> auth.onesign.io
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Template Editor Modal */}
      {showEmailEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Edit Email Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  value={selectedTemplate.name}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={selectedTemplate.subject}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Body</label>
                <textarea
                  value={selectedTemplate.body}
                  onChange={(e) =>
                    setSelectedTemplate({ ...selectedTemplate, body: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  rows={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: user_name, tenant_name, reset_link, invitation_link
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEmailTemplate}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowEmailEditor(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {previewMode === 'login' ? renderLoginPreview() : renderEmailPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
