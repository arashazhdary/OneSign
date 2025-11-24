import { Helmet } from 'react-helmet-async';
import Card from '@/components/common/Card';

const UsersPage = () => {
  return (
    <>
      <Helmet>
        <title>Tenant Users - OneSign Admin Portal</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Tenant Users
        </h1>
        <Card>
          <p className="text-slate-600 dark:text-slate-400">
            Tenant users interface coming soon...
          </p>
        </Card>
      </div>
    </>
  );
};

export default UsersPage;
