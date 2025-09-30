<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          შესვლა თქვენს ანგარიშზე
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          ან
          <router-link to="/register" class="font-medium text-red-600 hover:text-red-500">
            შექმენით ახალი ანგარიში
          </router-link>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <SignInComponent
          @close="handleLoginSuccess"
          @next-step="handleStepChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'
import SignInComponent from '@/components/auth/SignInComponent.vue'

const router = useRouter()

const handleLoginSuccess = () => {
  // Just go to home page after login
  router.push('/')
}

const handleStepChange = (payload) => {
  console.log('Auth step changed:', payload)
}
</script>
