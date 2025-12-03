import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import TenantSidebar from '@/components/common/TenantSidebar';
import TopBar from '@/components/common/TopBar';
import { useUIStore } from '@/stores/uiStore';
import { useDirection } from '@/hooks/useDirection';

export const TenantLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { isRTL } = useDirection();
  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TenantSidebar />
      <TopBar />

      <motion.main
        initial={false}
        animate={isRTL
          ? {
              marginRight: `${sidebarWidth}px`,
              marginLeft: 0,
              width: `calc(100% - ${sidebarWidth}px)`
            }
          : {
              marginLeft: `${sidebarWidth}px`,
              marginRight: 0,
              width: `calc(100% - ${sidebarWidth}px)`
            }
        }
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
