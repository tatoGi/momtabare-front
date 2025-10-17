<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from "@/components/ui/toast/use-toast"

const props = defineProps<{
  paymentUrl: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  paymentComplete: [success: boolean]
}>()

const router = useRouter()
const { addToast } = useToast()
const paymentWindow = ref<Window | null>(null)
const checkInterval = ref<number | null>(null)

// Open payment in a centered popup window
function openPaymentPopup() {
  if (!props.paymentUrl) return

  const width = 800
  const height = 900
  const left = (window.screen.width / 2) - (width / 2)
  const top = (window.screen.height / 2) - (height / 2)

  const features = `
    width=${width},
    height=${height},
    left=${left},
    top=${top},
    toolbar=no,
    menubar=no,
    scrollbars=yes,
    resizable=yes,
    status=no
  `.replace(/\s+/g, '')

  paymentWindow.value = window.open(props.paymentUrl, 'BogPayment', features)

  if (paymentWindow.value) {
    // Focus the popup
    paymentWindow.value.focus()

    // Start checking if window is closed or redirected
    checkInterval.value = window.setInterval(() => {
      checkPaymentStatus()
    }, 1000)

    addToast({
      title: 'გადახდის ფანჯარა გაიხსნა',
      description: 'გთხოვთ შეავსოთ თქვენი ბარათის დეტალები ახალ ფანჯარაში',
      variant: 'info',
      duration: 5000
    })
  } else {
    addToast({
      title: 'შეცდომა',
      description: 'გთხოვთ დაუშვათ popup ფანჯრები თქვენი ბრაუზერში',
      variant: 'destructive',
      duration: 5000
    })
    emit('close')
  }
}

// Check payment window status
function checkPaymentStatus() {
  if (!paymentWindow.value) return

  // Check if window was closed
  if (paymentWindow.value.closed) {
    cleanup()
    emit('close')
    
    addToast({
      title: 'გადახდის ფანჯარა დაიხურა',
      description: 'თუ გადახდა დასრულდა, შეამოწმეთ თქვენი შეკვეთები',
      variant: 'info',
      duration: 5000
    })
    return
  }

  // Try to check URL (will fail due to CORS, but worth trying)
  try {
    const url = paymentWindow.value.location.href
    
    if (url.includes('/payment/success')) {
      cleanup()
      emit('paymentComplete', true)
      emit('close')
      paymentWindow.value.close()
      
      addToast({
        title: 'გადახდა წარმატებული',
        description: 'თქვენი გადახდა წარმატებით განხორციელდა',
        variant: 'success',
        duration: 5000
      })
      
      router.push({ name: 'user-orders' })
    } else if (url.includes('/payment/fail')) {
      cleanup()
      emit('paymentComplete', false)
      emit('close')
      paymentWindow.value.close()
      
      addToast({
        title: 'გადახდა ვერ მოხერხდა',
        description: 'გთხოვთ სცადოთ თავიდან',
        variant: 'destructive',
        duration: 5000
      })
      
      router.push({ name: 'cart' })
    }
  } catch (e) {
    // Cross-origin error - expected
  }
}

function cleanup() {
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
    checkInterval.value = null
  }
  paymentWindow.value = null
}

// Watch for isOpen changes
import { watch } from 'vue'

watch(() => props.isOpen, (isOpen: boolean) => {
  if (isOpen) {
    openPaymentPopup()
  } else {
    cleanup()
  }
})

onBeforeUnmount(() => {
  cleanup()
  if (paymentWindow.value && !paymentWindow.value.closed) {
    paymentWindow.value.close()
  }
})
</script>

<template>
  <!-- This component doesn't render anything visible -->
  <!-- It just manages the payment popup window -->
  <div v-if="false"></div>
</template>
