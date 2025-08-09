<template>
  <div class="loading-wrapper">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">{{ loadingText }}</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">{{ errorTitle }}</h3>
      <p class="error-message">{{ error }}</p>
      <button v-if="showRetry" @click="$emit('retry')" class="retry-button">
        {{ retryText }}
      </button>
    </div>
    
    <!-- Content State -->
    <div v-else class="content-container">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingWrapper',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: undefined
    },
    loadingText: {
      type: String,
      default: 'მონაცემების ჩატვირთვა...'
    },
    errorTitle: {
      type: String,
      default: 'შეცდომა'
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    retryText: {
      type: String,
      default: 'თავიდან ცდა'
    }
  },
  emits: ['retry']
});
</script>

<style scoped>
.loading-wrapper {
  width: 100%;
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: #dc3545;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.error-message {
  color: #666;
  font-size: 1rem;
  margin: 0 0 2rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.retry-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #0056b3;
}

.content-container {
  width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
  .loading-container,
  .error-container {
    padding: 2rem 1rem;
  }
  
  .error-title {
    font-size: 1.25rem;
  }
  
  .error-message {
    font-size: 0.9rem;
  }
}
</style>
