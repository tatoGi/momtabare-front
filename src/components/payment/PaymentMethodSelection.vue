<template>
  <div class="payment-method-selection">
    <h2 class="text-xl font-bold mb-6">{{ $t('payment.selectMethod') }}</h2>
    
    <!-- Saved Cards -->
    <div v-if="savedCards.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ $t('payment.savedCards') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="card in savedCards"
          :key="card.id"
          :class="[
            'p-4 border rounded-lg cursor-pointer transition-colors',
            selectedCard?.id === card.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
          ]"
          @click="selectedCard = card"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">•••• {{ card.last4 }}</p>
              <p class="text-sm text-gray-500">{{ card.brand }}</p>
            </div>
            <span
              :class="[
                'w-4 h-4 rounded-full border',
                selectedCard?.id === card.id ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
              ]"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- New Card Payment -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">{{ $t('payment.newCard') }}</h3>
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="saveCard"
            class="form-checkbox h-4 w-4 text-primary-500 rounded border-gray-300"
          >
          <span class="text-sm text-gray-700">{{ $t('payment.saveCard') }}</span>
        </label>
      </div>
    </div>

    <!-- Pay Button -->
    <BaseButton
      :loading="loading"
      :disabled="loading"
      class="w-full"
      @click="handlePayment"
    >
      {{ $t('payment.pay', { amount: formatPrice(cart.total_price) }) }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useBogPayment } from '@/services/bogPayment'
import type { IBogOrderResponse } from '@/ts/services/bogPayment.types'

// Types
interface SavedCard {
  id: string
  last4: string
  brand: string
  parentOrderId: string
}

interface Props {
  cart: {
    total_price: number
    items: Array<any>
  }
}

// Props
const props = defineProps<Props>()

// Composables
const { processCheckout } = useBogPayment()

// State
const loading = ref(false)
const saveCard = ref(false)
const savedCards = ref<SavedCard[]>([])
const selectedCard = ref<SavedCard | null>(null)

// Format price helper
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ka-GE', {
    style: 'currency',
    currency: 'GEL'
  }).format(price)
}

// Handle payment
const handlePayment = async () => {
  loading.value = true
  try {
    const response: IBogOrderResponse = await processCheckout(
      props.cart,
      saveCard.value,
      selectedCard.value
    )
    
    if (!response.success) {
      throw new Error(response.message || 'Payment failed')
    }
    
    // Success handling is managed by the payment service redirect
  } catch (error: any) {
    console.error('Payment error:', error)
    // Show error using your preferred notification system
    window.alert(error.message || 'Payment failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<i18n>
{
  "en": {
    "payment": {
      "selectMethod": "Select Payment Method",
      "savedCards": "Saved Cards",
      "newCard": "New Card",
      "saveCard": "Save card for future payments",
      "pay": "Pay {amount}"
    }
  },
  "ka": {
    "payment": {
      "selectMethod": "აირჩიეთ გადახდის მეთოდი",
      "savedCards": "შენახული ბარათები",
      "newCard": "ახალი ბარათი",
      "saveCard": "ბარათის შენახვა მომავალი გადახდებისთვის",
      "pay": "გადახდა {amount}"
    }
  }
}
</i18n>
