import { motion } from 'framer-motion';
import { Bell, Moon, Sun, LogOut, User, Languages } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDirection } from '@/hooks/useDirection';
import { cn } from '@/utils/cn';

const TopBar: React.FC = () => {
  const { darkMode, toggleDarkMode, sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];
  const sidebarPadding = sidebarCollapsed ? '96px' : '296px';

  return (
    <motion.header
      initial={false}
      animate={isRTL
        ? { paddingRight: sidebarPadding, paddingLeft: 0 }
        : { paddingLeft: sidebarPadding, paddingRight: 0 }
      }
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 left-0 h-16 glass z-30 flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('common.welcomeBack')}, {user?.name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('common.happeningToday')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <motion.button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </motion.button>

        {/* Language switcher */}
        <div className="relative">
          <motion.button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Languages className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="text-lg">{currentLanguage.flag}</span>
          </motion.button>

          {showLanguageMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl shadow-soft-lg p-2"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left',
                    i18n.language === lang.code
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full animate-pulse" />
          </motion.button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl shadow-soft-lg p-4 max-h-96 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {t('common.notifications')}
                </h3>
                <span className="text-xs text-slate-500">3 {t('common.unread')}</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {t('common.newUserRegistered')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">2 {t('common.minutesAgo')}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-xs">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role || 'Admin'}
              </p>
            </div>
          </motion.button>

          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-soft-lg p-2"
            >
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm text-slate-900 dark:text-white">
                  {t('common.profile')}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors text-left text-danger-600 dark:text-danger-400"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('auth.logout')}</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
