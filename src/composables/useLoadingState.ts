import { ref, computed } from 'vue';

export function useLoadingState() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);
  const isReady = computed(() => !loading.value && !error.value);

  const setLoading = (state: boolean) => {
    loading.value = state;
    if (state) {
      error.value = null; // Clear error when starting new loading
    }
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
    loading.value = false;
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    loading.value = false;
    error.value = null;
  };

  // Wrapper function for async operations
  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'მოხდა შეცდომა';
      setError(errorMessage);
      return null;
    }
  };

  return {
    loading: loading,
    error: error,
    isLoading,
    hasError,
    isReady,
    setLoading,
    setError,
    clearError,
    reset,
    withLoading
  };
}
