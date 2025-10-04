<template>
  <div class="max-w-[1360px] mx-auto">
    <!-- Header Skeleton -->
    <div class="h-20 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
    
    <!-- Main Content Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <!-- Sidebar Skeleton -->
      <div class="hidden md:block space-y-4">
        <div v-for="i in 5" :key="i" class="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
      
      <!-- Main Content Area -->
      <div class="md:col-span-3 space-y-6">
        <!-- Hero Banner -->
        <div class="h-48 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        
        <!-- Featured Section -->
        <div>
          <div class="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-4 animate-pulse"></div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="space-y-2">
              <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
              <div class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer Skeleton -->
    <div class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="space-y-3">
          <div class="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          <div v-for="j in 3" :key="j" class="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component provides a skeleton loading state for the main app layout
</script>
