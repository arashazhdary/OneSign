import { Helmet } from 'react-helmet-async';
import Card from '@/components/common/Card';

const SettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>Tenant Settings - OneSign Admin Portal</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Tenant Settings
        </h1>
        <Card>
          <p className="text-slate-600 dark:text-slate-400">
            Tenant settings interface coming soon...
          </p>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
