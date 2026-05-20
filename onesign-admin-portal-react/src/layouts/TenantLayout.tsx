import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import TenantSidebar from '@/components/common/TenantSidebar';
import TopBar from '@/components/common/TopBar';
import { CopilotProvider } from '@/app/contexts/CopilotContext';
import { CopilotSidebar, COPILOT_PANEL_WIDTH } from '@/components/copilot/CopilotSidebar';
import { useUIStore } from '@/stores/uiStore';
import { useDirection } from '@/hooks/useDirection';

export const TenantLayout: React.FC = () => {
  const { sidebarCollapsed, copilotOpen } = useUIStore();
  const { isRTL } = useDirection();
  const sidebarWidth = sidebarCollapsed ? 80 : 280;
  const copilotMargin = copilotOpen ? COPILOT_PANEL_WIDTH : 0;

  return (
    <CopilotProvider>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TenantSidebar />
      <TopBar />
      <CopilotSidebar />

      <motion.main
        initial={false}
        animate={isRTL
          ? {
              marginRight: `${sidebarWidth}px`,
              marginLeft: copilotMargin,
              width: `calc(100% - ${sidebarWidth}px - ${copilotMargin}px)`
            }
          : {
              marginLeft: `${sidebarWidth}px`,
              marginRight: copilotMargin,
              width: `calc(100% - ${sidebarWidth}px - ${copilotMargin}px)`
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
    </CopilotProvider>
  );
};
