import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/common/AdminSidebar';
import TopBar from '@/components/common/TopBar';
import { useUIStore } from '@/stores/uiStore';
import { useDirection } from '@/hooks/useDirection';

export const AdminLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { isRTL } = useDirection();
  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      <TopBar />

      <motion.main
        initial={false}
        animate={isRTL 
          ? { marginRight: sidebarWidth, marginLeft: 0 }
          : { marginLeft: sidebarWidth, marginRight: 0 }
        }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 w-full"
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
