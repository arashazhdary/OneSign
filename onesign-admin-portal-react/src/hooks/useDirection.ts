import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['fa', 'ar', 'he'];

export const useDirection = () => {
  try {
    const { i18n } = useTranslation();

    const isRTL = RTL_LANGUAGES.includes(i18n.language || 'en');
    const direction = isRTL ? 'rtl' : 'ltr';

    useEffect(() => {
      if (i18n && i18n.language) {
        document.documentElement.dir = direction;
        document.documentElement.lang = i18n.language;
      }
    }, [direction, i18n?.language]);

    return { isRTL, direction };
  } catch (error) {
    console.warn('Error in useDirection hook:', error);
    // Fallback to LTR if i18n is not ready
    useEffect(() => {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }, []);
    return { isRTL: false, direction: 'ltr' };
  }
};

export default useDirection;
