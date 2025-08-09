import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  // Global loading state
  const isLoading = ref(false);
  const loadingMessage = ref('მონაცემების ჩატვირთვა...');
  const error = ref<string | null>(null);

  // Set loading state
  const setLoading = (loading: boolean, message?: string) => {
    isLoading.value = loading;
    if (message) {
      loadingMessage.value = message;
    }
    if (loading) {
      error.value = null; // Clear error when starting new loading
    }
  };

  // Set error state
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
    isLoading.value = false;
  };

  // Clear all states
  const reset = () => {
    isLoading.value = false;
    error.value = null;
    loadingMessage.value = 'მონაცემების ჩატვირთვა...';
  };

  // Show page loading
  const showPageLoading = (pageName?: string) => {
    const message = pageName ? `${pageName} ჩატვირთვა...` : 'გვერდის ჩატვირთვა...';
    setLoading(true, message);
  };

  // Hide page loading
  const hidePageLoading = () => {
    setLoading(false);
  };

  return {
    isLoading,
    loadingMessage,
    error,
    setLoading,
    setError,
    reset,
    showPageLoading,
    hidePageLoading
  };
});
