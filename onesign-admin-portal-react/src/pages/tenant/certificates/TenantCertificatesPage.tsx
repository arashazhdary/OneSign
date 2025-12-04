import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Plus,
  RefreshCw,
  Upload,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  Clock,
  Award,
  FileKey,
  Lock,
  AlertTriangle,
  Download,
  XCircle
} from 'lucide-react';
import { tenantService } from '@/lib/api/services/tenant.service';
import Modal from '@/components/common/Modal';

interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuer: string;
  expiresAt: string;
  createdAt: string;
  status: 'valid' | 'expiring' | 'expired';
  type: 'ssl' | 'tls' | 'client';
  serialNumber: string;
  fingerprint: string;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'cyan' | 'yellow';
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon, trend, trendLabel, color, delay = 0 }: StatCardProps) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', glow: 'hover:shadow-blue-100 dark:hover:shadow-blue-900/20' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800', glow: 'hover:shadow-green-100 dark:hover:shadow-green-900/20' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', glow: 'hover:shadow-purple-100 dark:hover:shadow-purple-900/20' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', glow: 'hover:shadow-orange-100 dark:hover:shadow-orange-900/20' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', glow: 'hover:shadow-red-100 dark:hover:shadow-red-900/20' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', glow: 'hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', glow: 'hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', glow: 'hover:shadow-yellow-100 dark:hover:shadow-yellow-900/20' }
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-lg ${colors.glow} transition-all duration-300 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-500 dark:text-slate-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default function TenantCertificatesPage() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await tenantService.getCertificates();
      const mockData: Certificate[] = [
        {
          id: '1',
          name: t('tenant.certificates.mockData.mainSSL'),
          domain: '*.example.com',
          issuer: "Let's Encrypt Authority X3",
          expiresAt: '2025-06-15T00:00:00Z',
          createdAt: '2024-06-15T00:00:00Z',
          status: 'valid',
          type: 'ssl',
          serialNumber: '04:A1:2F:...',
          fingerprint: 'SHA256:A1:B2:C3:...',
        },
        {
          id: '2',
          name: t('tenant.certificates.mockData.apiCert'),
          domain: 'api.example.com',
          issuer: 'DigiCert Inc',
          expiresAt: '2025-01-10T00:00:00Z',
          createdAt: '2024-01-10T00:00:00Z',
          status: 'expiring',
          type: 'tls',
          serialNumber: '05:B2:3G:...',
          fingerprint: 'SHA256:B2:C3:D4:...',
        },
      ];
      setCertificates(data || mockData);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.message || t('common.failedToLoadCertificates'));
      setCertificates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setSubmitting(true);
    setError('');
    try {
      await tenantService.uploadCertificate('tenant-id', file);
      setShowUpload(false);
      setFile(null);
      setSuccess(t('tenant.certificates.messages.uploadSuccess'));
      fetchCertificates(true);
    } catch (err: any) {
      setError(err.message || t('common.failedToUploadCertificate'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCert) return;

    setSubmitting(true);
    setError('');
    try {
      await tenantService.deleteCertificate(selectedCert.id);
      setShowDeleteConfirm(false);
      setSelectedCert(null);
      setSuccess(t('tenant.certificates.messages.deleteSuccess'));
      fetchCertificates(true);
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteCertificate'));
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getStats = () => {
    const total = certificates.length;
    const valid = certificates.filter(c => c.status === 'valid').length;
    const expiring = certificates.filter(c => c.status === 'expiring').length;
    const expired = certificates.filter(c => c.status === 'expired').length;

    return { total, valid, expiring, expired };
  };

  const stats = getStats();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return t('tenant.certificates.status.valid');
      case 'expiring': return t('tenant.certificates.status.expiring');
      case 'expired': return t('tenant.certificates.status.expired');
      default: return status;
    }
  };

  const filteredCerts = certificates.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-500" />
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
        <title>{t('tenant.certificates.title')} | OneSign</title>
      </Helmet>

      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 min-h-screen" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              {t('tenant.certificates.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('tenant.certificates.subtitle')}
            </motion.p>
          </div>
          <div className="flex gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchCertificates(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              {t('common.uploadCertificate')}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('tenant.certificates.stats.total')}
            value={stats.total}
            icon={<Award className="w-6 h-6" />}
            color="cyan"
            delay={0}
          />
          <StatCard
            title={t('tenant.certificates.stats.valid')}
            value={stats.valid}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
            delay={1}
          />
          <StatCard
            title={t('tenant.certificates.stats.expiring')}
            value={stats.expiring}
            subtitle={t('tenant.certificates.stats.needsRenewal')}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="yellow"
            delay={2}
          />
          <StatCard
            title={t('tenant.certificates.stats.expired')}
            value={stats.expired}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            delay={3}
          />
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4"
        >
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('tenant.certificates.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Certificates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredCerts.length > 0 ? (
            filteredCerts.map((cert, idx) => {
              const daysLeft = getDaysUntilExpiry(cert.expiresAt);
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          cert.status === 'valid' ? 'bg-green-100 dark:bg-green-900/30' :
                          cert.status === 'expiring' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <FileKey className={`w-5 h-5 ${
                            cert.status === 'valid' ? 'text-green-600 dark:text-green-400' :
                            cert.status === 'expiring' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {cert.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {cert.domain}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(cert.status)}`}>
                          {getStatusLabel(cert.status)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                          {cert.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.certificates.fields.issuer')}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{cert.issuer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.certificates.fields.expiryDate')}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatDate(cert.expiresAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.certificates.fields.daysRemaining')}</p>
                            <p className={`text-sm font-medium ${
                              daysLeft > 30 ? 'text-green-600' :
                              daysLeft > 0 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {daysLeft > 0 ? t('tenant.certificates.fields.daysValue', { days: daysLeft }) : t('tenant.certificates.status.expired')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{t('tenant.certificates.fields.createdDate')}</p>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatDate(cert.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedCert(cert);
                          setShowDetails(true);
                        }}
                        className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedCert(cert);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('tenant.certificates.empty.title')}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {t('tenant.certificates.empty.description')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all"
              >
                {t('tenant.certificates.empty.uploadFirst')}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Upload Modal */}
        <Modal
          isOpen={showUpload}
          onClose={() => {
            setShowUpload(false);
            setFile(null);
          }}
          title={t('tenant.certificates.upload.title')}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tenant.certificates.upload.fileLabel')}
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors">
                <input
                  type="file"
                  accept=".pem,.crt,.cer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cert-file"
                />
                <label htmlFor="cert-file" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {file ? file.name : t('tenant.certificates.upload.selectFile')}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {t('tenant.certificates.upload.supportedFormats')}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setFile(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || submitting}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl hover:from-cyan-700 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.certificates.upload.uploading') : t('tenant.certificates.upload.submit')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Details Modal */}
        <Modal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedCert(null);
          }}
          title={t('tenant.certificates.details.title')}
          size="lg"
        >
          {selectedCert && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  selectedCert.status === 'valid' ? 'bg-green-100 dark:bg-green-900/30' :
                  selectedCert.status === 'expiring' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <Shield className={`w-8 h-8 ${
                    selectedCert.status === 'valid' ? 'text-green-600 dark:text-green-400' :
                    selectedCert.status === 'expiring' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedCert.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">{selectedCert.domain}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full mr-auto ${getStatusStyle(selectedCert.status)}`}>
                  {getStatusLabel(selectedCert.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.type')}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedCert.type.toUpperCase()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.issuer')}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedCert.issuer}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.createdDate')}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedCert.createdAt)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.expiryDate')}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedCert.expiresAt)}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.serialNumber')}</p>
                <code className="text-sm font-mono text-slate-900 dark:text-white">{selectedCert.serialNumber}</code>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('tenant.certificates.fields.fingerprint')}</p>
                <code className="text-sm font-mono text-slate-900 dark:text-white">{selectedCert.fingerprint}</code>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedCert(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedCert(null);
          }}
          title={t('tenant.certificates.delete.title')}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex gap-3">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-800 dark:text-red-300 font-medium mb-1">
                    {t('tenant.certificates.delete.confirm')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {t('tenant.certificates.delete.warning')}
                  </p>
                </div>
              </div>
            </div>

            {selectedCert && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('tenant.certificates.delete.selected')}</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedCert.name}</p>
                <p className="text-sm text-slate-500">{selectedCert.domain}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedCert(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {submitting ? t('tenant.certificates.delete.deleting') : t('tenant.certificates.delete.submit')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
