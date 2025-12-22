import { useQueueContext } from '@/contexts/QueueContext';

export function useQueue() {
  return useQueueContext();
}
