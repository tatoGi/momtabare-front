import { ref } from 'vue';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const toasts = ref<Toast[]>([]);

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...toast, id };
  
  toasts.value.push(newToast);
  
  // Auto-remove toast after duration (default: 5000ms)
  const duration = toast.duration ?? 5000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
}

function removeToast(id: string) {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

export function useToast() {
  return {
    toasts,
    addToast,
    removeToast,
  };
}