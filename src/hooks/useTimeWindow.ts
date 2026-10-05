import { useFinanceStore } from '@/store';

export function useTimeWindow() {
  const activeTimeWindow = useFinanceStore((state) => state.activeTimeWindow);
  const setTimeWindow = useFinanceStore((state) => state.setTimeWindow);

  return { activeTimeWindow, setTimeWindow };
}