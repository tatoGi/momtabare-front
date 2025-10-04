<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'default' | 'list' | 'card' | 'table' | 'form';
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  foregroundColor?: string;
  speed?: number;
}>(), {
  type: 'default',
  width: '100%',
  height: '100px',
  backgroundColor: '#f3f3f3',
  foregroundColor: '#ecebeb',
  speed: 1.2
});

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  backgroundColor: props.backgroundColor,
  backgroundImage: `linear-gradient(
    to right,
    ${props.backgroundColor} 0%,
    ${props.foregroundColor} 20%,
    ${props.backgroundColor} 40%,
    ${props.backgroundColor} 100%
  )`,
  backgroundSize: '200% 100%',
  animation: `shimmer ${props.speed}s infinite linear`,
  borderRadius: '4px',
  margin: '0 auto',
  maxWidth: '100%',
  overflow: 'hidden',
  position: 'relative'
}));
</script>

<template>
  <div 
    class="content-loader" 
    :style="containerStyle"
    :class="`content-loader--${type}`"
  ></div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.content-loader {
  position: relative;
  overflow: hidden;
}

/* Different loader types */
.content-loader--default {
  border-radius: 4px;
}

.content-loader--card {
  border-radius: 8px;
}

.content-loader--table {
  border-radius: 0;
}

.content-loader--form {
  border-radius: 4px;
}

.content-loader--list {
  border-radius: 0;
  margin-bottom: 8px;
}
</style>
