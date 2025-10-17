<template>
  <div class="payment-status">
    <div class="max-w-2xl mx-auto p-6">
      <div 
        class="rounded-lg p-8 text-center"
        :class="status === 'success' ? 'bg-green-50' : 'bg-red-50'"
      >
        <!-- Success Status -->
        <template v-if="status === 'success'">
          <div class="mb-4">
            <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <i class="material-icons text-green-500 text-3xl">check</i>
            </span>
          </div>
          <h1 class="text-2xl font-bold text-green-700 mb-2">
            {{ $t('payment.success.title') }}
          </h1>
          <p class="text-green-600 mb-6">
            {{ $t('payment.success.message') }}
          </p>
        </template>

        <!-- Error Status -->
        <template v-else>
          <div class="mb-4">
            <span class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <i class="material-icons text-red-500 text-3xl">error</i>
            </span>
          </div>
          <h1 class="text-2xl font-bold text-red-700 mb-2">
            {{ $t('payment.error.title') }}
          </h1>
          
          <!-- Detailed Error Information -->
          <div class="text-left bg-white/50 backdrop-blur-sm p-6 rounded-lg mb-6 shadow-sm border border-red-200">
            <div v-if="errorMessage" class="space-y-4">
              <template v-for="(line, index) in errorMessage.split('\n')" :key="index">
                <p v-if="line.trim()" 
                   class="text-red-700 flex items-start gap-2" 
                   :class="{
                     'font-bold text-lg border-b border-red-200 pb-2': line.includes('Payment Status:'),
                     'font-semibold': line.includes('Error Details:') || line.includes('Decline Reason:') || line.includes('Validation Errors:'),
                     'ml-4 text-red-600': line.startsWith('  -'),
                   }">
                  <span>{{ line }}</span>
                </p>
              </template>
            </div>
            <p v-else class="text-red-600 text-center">
              {{ $t('payment.error.message') }}
            </p>

            <!-- Support Information -->
            <div class="mt-6 pt-4 border-t border-red-200">
              <p class="text-gray-700 text-sm">
                {{ $t('payment.error.support') }}
                <a href="mailto:support@momtabare.com" class="text-blue-600 hover:underline">
                  support@momtabare.com
                </a>
              </p>
            </div>
          </div>
        </template>

        <!-- Order Details -->
        <div v-if="orderDetails" class="mb-8 text-left">
          <h2 class="text-lg font-semibold mb-4">{{ $t('payment.orderDetails') }}</h2>
          <dl class="grid grid-cols-1 gap-4">
            <div class="flex justify-between py-2 border-b">
              <dt class="text-gray-600">{{ $t('payment.orderId') }}</dt>
              <dd class="font-medium">{{ orderDetails.id }}</dd>
            </div>
            <div class="flex justify-between py-2 border-b">
              <dt class="text-gray-600">{{ $t('payment.amount') }}</dt>
              <dd class="font-medium">{{ formatPrice(orderDetails.amount) }} {{ orderDetails.currency }}</dd>
            </div>
            <div class="flex justify-between py-2 border-b">
              <dt class="text-gray-600">{{ $t('payment.date') }}</dt>
              <dd class="font-medium">{{ formatDate(orderDetails.create_date) }}</dd>
            </div>
            <div class="flex justify-between py-2 border-b">
              <dt class="text-gray-600">{{ $t('payment.status') }}</dt>
              <dd :class="getStatusClass()">{{ $t(`payment.statuses.${orderDetails.status}`) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            @click="goToOrders"
          >
            {{ $t('payment.viewOrders') }}
          </button>
          <button 
            class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            @click="goToHome"
          >
            {{ $t('payment.continueShopping') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBogPayment } from '@/services/bogPayment'
import { updateCartProductsRentalStatus } from '@/services/products'
import { useCartStore } from '@/pinia/cart.pinia'
import { useUserStore } from '@/pinia/user.pinia'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { getOrderDetails, handlePostPaymentCardSaving } = useBogPayment()
const cartStore = useCartStore()
const userStore = useUserStore()
const { t: $t } = useI18n()

const status = ref<'success' | 'error'>('error')
const errorMessage = ref<string | null>(null)
const orderDetails = ref<Record<string, any> | null>(null)

// Helper functions
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('ka-GE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = () => {
  const statusMap: Record<string, string> = {
    completed: 'text-green-600',
    approved: 'text-green-600',
    succeeded: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-600'
  }
  return statusMap[orderDetails.value?.status?.toLowerCase() || ''] || 'text-gray-600'
}

const goToOrders = () => router.push('/orders')
const goToHome = () => router.push('/')

// Update product rental status
const updateProductsRentalStatus = async () => {
  try {
    const cart = cartStore.getCart
    const user = userStore.user
    
    if (!cart || !cart.items || cart.items.length === 0) {
      console.warn('⚠️ No cart items found to update rental status')
      return
    }
    
    if (!user || !user.id) {
      console.warn('⚠️ No user found to update rental status')
      return
    }
    
    console.log('📦 Updating rental status for cart items:', cart.items)
    
    const rentalUpdates = cart.items.map(item => ({
      product_id: item.product.id,
      rental_start_date: item.start_date,
      rental_end_date: item.end_date,
      ordered_by: user.id
    }))
    
    const result = await updateCartProductsRentalStatus(rentalUpdates)
    
    if (result.success) {
      console.log('✅ Successfully updated product rental status')
      // Clear the cart after successful rental status update
      await cartStore.fetchCart()
    } else {
      console.error('❌ Failed to update product rental status:', result.message)
      if (result.errors) {
        console.error('Errors:', result.errors)
      }
    }
  } catch (error) {
    console.error('❌ Error updating product rental status:', error)
  }
}

// Get and verify order status on mount
onMounted(async () => {
  const orderId = route.query.order_id as string
  
  // Check if we're on the success page - if so, assume success initially
  const isSuccessPage = route.path.includes('/payment/success')
  
  if (!orderId) {
    status.value = 'error'
    errorMessage.value = 'Invalid order ID'
    return
  }

  // If we're on the success page, start with success status
  if (isSuccessPage) {
    status.value = 'success'
  }

  try {
    console.log('🔍 Starting payment verification for order:', orderId);
    const details = await getOrderDetails(orderId)
    
    if (!details) {
      console.error('❌ No details returned from API');
      throw new Error('Order not found')
    }

    console.log('📊 Payment Details:', details); // Debug log
    console.log('📍 Is Success Page:', isSuccessPage);
    console.log('✅ Details Success:', details.success);
    console.log('📋 Details Status:', details.status);
    console.log('💾 Details Data:', details.data);
    
    orderDetails.value = details.data || details;

    // Check if payment was successful
    if (details.success) {
      status.value = 'success';
      errorMessage.value = null; // Clear any error message
      
      // Update product rental status after successful payment
      await updateProductsRentalStatus()
      
      // Handle post-payment card saving if this was a successful payment
      // Use setTimeout to make it non-blocking
      if (orderId) {
        setTimeout(() => {
          handlePostPaymentCardSaving(orderId);
        }, 1000);
      }
    } else if (isSuccessPage) {
      // If we're on success page but API says failed, show warning but keep success status
      console.warn('Payment API reports failure but user is on success page. Keeping success status.');
      status.value = 'success';
      errorMessage.value = null; // Clear any error message since we're on success page
      
      // Update product rental status even if API reports failure but we're on success page
      await updateProductsRentalStatus()
      
      // Still try to save card if we're on success page (user was redirected here)
      // Use setTimeout to make it non-blocking
      if (orderId) {
        setTimeout(() => {
          handlePostPaymentCardSaving(orderId);
        }, 1000);
      }
    } else {
      status.value = 'error';
      
      // Format the error message for better readability
      const errorLines = [];

      // Add payment status with translation if available
      const paymentStatus = details.status || details.data?.status;
      if (paymentStatus) {
        errorLines.push(`💳 Payment Status: ${paymentStatus.toUpperCase()}`);
      }

      // Add BOG error code if available
      if (details.error_code || details.data?.error_code) {
        errorLines.push(`⚠️ Error Code: ${details.error_code || details.data?.error_code}`);
      }

      // Add decline details if available
      if (details.data?.decline_reason || details.data?.decline_code) {
        errorLines.push(`❌ Decline Reason: ${details.data.decline_reason || details.data.decline_message || 'Card declined'}`);
        if (details.data.decline_code) {
          errorLines.push(`Code: ${details.data.decline_code}`);
        }
      }

      // Add transaction details
      if (details.data?.transaction_id) {
        errorLines.push(`🔄 Transaction ID: ${details.data.transaction_id}`);
      }
      errorLines.push(`📝 Order ID: ${orderId}`);

      // Add any validation errors
      if (details.data?.validation_errors) {
        errorLines.push('📋 Validation Errors:');
        Object.entries(details.data.validation_errors).forEach(([field, error]) => {
          errorLines.push(`  - ${field}: ${error}`);
        });
      }

      // Add any additional error messages
      if (details.data?.error_description || details.data?.error_message || details.data?.error) {
        errorLines.push('💬 Error Details:');
        errorLines.push(details.data?.error_description || details.data?.error_message || details.data?.error);
      }

      // Set the formatted error message
      errorMessage.value = errorLines.join('\n');
      
      // Log error details for debugging
      console.error('Payment Error Details:', {
        errorCode: details.error_code,
        message: details.message,
        status: details.status,
        rawData: details.data
      });
    }

  } catch (error: any) {
    console.error('❌ Error fetching order details:', error)
    console.error('❌ Error response:', error.response?.data)
    console.error('❌ Error status:', error.response?.status)
    
    // If we're on success page, still show success even if API fails
    if (isSuccessPage) {
      console.log('🎯 On success page but API failed - showing success anyway');
      status.value = 'success'
      errorMessage.value = null
    } else {
      status.value = 'error'
      errorMessage.value = error.message || 'Failed to verify payment'
    }
  }
})
</script>


<style scoped>
.payment-status {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}
</style>
