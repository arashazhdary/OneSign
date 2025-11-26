import { useTranslation } from 'react-i18next';

/**
 * Hook to get the current locale/language from i18n
 * Returns the current language code (e.g., 'en', 'fa')
 */
export const useLocale = (): string => {
  const { i18n } = useTranslation();
  return i18n?.language || 'en';
};

export default useLocale;

