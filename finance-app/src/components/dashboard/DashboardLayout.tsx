import { ReactNode } from 'react';
import { useFinanceStore } from '@/store';
import { TIME_WINDOWS, type TimeWindow } from '@/constants/timeWindows';
import { Button } from '../common';
import { Select } from '../common';
import { CompanySelector } from './CompanySelector';
import { CustomCompanyView } from './CustomCompanyView';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const setTimeWindow = useFinanceStore((state) => state.setTimeWindow);
  const error = useFinanceStore((state) => state.error);
  const setError = useFinanceStore((state) => state.setError);
  const customCompanySymbol = useFinanceStore((state) => state.customCompanySymbol);
  const clearCustomCompany = useFinanceStore((state) => state.clearCustomCompany);

  const windowOptions = TIME_WINDOWS.map((w) => ({
    value: w.value,
    label: w.label,
  }));

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1f2328]">Market Dashboard</h1>
              <p className="text-sm text-[#57606a]">IBM & Competitors — Real-time Finance Analytics</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={activeTimeWindow}
                onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
                options={windowOptions}
                placeholder="Select time window"
                className="w-auto sm:w-48"
              />
              <CompanySelector />
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
            <p className="text-sm text-yellow-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
        {customCompanySymbol && (
          <div className="mt-8 pt-8 border-t border-[#e5e7eb]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1f2328]">Custom Company</h2>
              <Button variant="ghost" size="sm" onClick={clearCustomCompany}>
                Remove
              </Button>
            </div>
            <CustomCompanyView />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-[#e5e7eb] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-[#57606a]">
          Data sourced from Yahoo Finance. Updates every 5 minutes. Not financial advice.
        </div>
      </footer>
    </div>
  );
}