import { Helmet } from 'react-helmet-async';
import Card from '@/components/common/Card';

const UsersPage = () => {
  return (
    <>
      <Helmet>
        <title>Users - OneSign Admin Portal</title>
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Users Management
        </h1>
        <Card>
          <p className="text-slate-600 dark:text-slate-400">
            User management interface coming soon...
          </p>
        </Card>
      </div>
    </>
  );
};

export default UsersPage;
