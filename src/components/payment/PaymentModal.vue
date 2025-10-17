<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps<{
  paymentUrl: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  paymentComplete: [success: boolean]
}>()

const router = useRouter()
const iframeRef = ref<HTMLIFrameElement | null>(null)
const isIframeLoading = ref(true)

// Handle iframe load
function handleIframeLoad() {
  console.log('Payment iframe loaded')
  isIframeLoading.value = false
}

// Handle messages from iframe (for payment completion detection)
function handleMessage(event: MessageEvent) {
  // Only accept messages from BOG payment domain
  if (!event.origin.includes('bog.ge')) {
    return
  }

  console.log('Payment iframe message:', event.data)

  // You can handle different payment statuses here
  // if (event.data.status === 'success') {
  //   emit('paymentComplete', true)
  // }
}

// Listen for URL changes in iframe to detect payment completion
function checkIframeUrl() {
  try {
    if (iframeRef.value?.contentWindow) {
      const iframeUrl = iframeRef.value.contentWindow.location.href
      console.log('Iframe URL:', iframeUrl)

      // Check if redirected to success/fail page
      if (iframeUrl.includes('/payment/success')) {
        emit('paymentComplete', true)
        emit('close')
        router.push({ name: 'payment-success' })
      } else if (iframeUrl.includes('/payment/fail')) {
        emit('paymentComplete', false)
        emit('close')
        router.push({ name: 'payment-fail' })
      }
    }
  } catch (e) {
    // Cross-origin error - expected when iframe is on different domain
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  
  // Periodically check iframe URL (will fail due to CORS but worth trying)
  const interval = setInterval(checkIframeUrl, 1000)
  
  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
    clearInterval(interval)
  })
})

// Close modal on Escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

watch(() => props.isOpen, (isOpen: boolean) => {
  if (isOpen) {
    // Reset loading state when modal opens
    isIframeLoading.value = true
    document.addEventListener('keydown', handleKeydown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-4"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-col">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                  გადახდის გვერდი
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  შეავსეთ თქვენი ბარათის დეტალები უსაფრთხოდ
                </p>
              </div>
              <button
                @click="emit('close')"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X :size="24" class="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <!-- Payment iframe -->
            <div class="flex-1 relative overflow-hidden">
              <iframe
                ref="iframeRef"
                :src="paymentUrl"
                class="w-full h-full border-0"
                sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox allow-modals"
                allow="payment; geolocation; microphone; camera; fullscreen"
                title="Payment Gateway"
                @load="handleIframeLoad"
              />
              
              <!-- Loading overlay (shows while iframe loads) -->
              <div v-if="isIframeLoading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 border-4 border-customRed border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-sm text-gray-600 dark:text-gray-400">იტვირთება...</p>
                </div>
              </div>
            </div>

            <!-- Footer info -->
            <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
                <span>უსაფრთხო კავშირი • თქვენი მონაცემები დაცულია SSL შიფრაციით</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* No additional styles needed */
</style>
