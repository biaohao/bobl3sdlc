import { DashboardLayout } from '@/components/dashboard';
import { CurrentDayView, SevenDayView, QuarterView } from '@/components/dashboard';
import { useFinanceStore } from '@/store';

export function DashboardPage() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);

  const renderView = () => {
    switch (activeTimeWindow) {
      case 'day':
        return <CurrentDayView />;
      case '7d':
        return <SevenDayView />;
      case 'quarter':
        return <QuarterView />;
      default:
        return <CurrentDayView />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" role="main" aria-label="Market dashboard">
        {renderView()}
      </div>
    </DashboardLayout>
  );
}