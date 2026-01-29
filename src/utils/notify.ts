import { toast } from 'sonner';

export function notify(
  enabled: boolean | undefined,
  type: 'success' | 'error' | 'info' | 'warning',
  message: string
) {
  if (!enabled) return;

  toast[type](message);
}
