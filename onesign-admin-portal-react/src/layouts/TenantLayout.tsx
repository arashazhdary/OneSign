import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/common/Sidebar';
import TopBar from '@/components/common/TopBar';
import { useUIStore } from '@/stores/uiStore';

export const TenantLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <TopBar />

      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? '80px' : '280px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16"
      >
        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};
