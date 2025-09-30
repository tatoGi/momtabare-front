<template>
  <div class="payment-status">
    <div v-if="loading" class="text-center p-4">
      <p>Processing your payment...</p>
    </div>

    <div v-else-if="isPaymentSuccessful" class="success">
      <h2>Payment Successful!</h2>
      <p v-if="orderId">Order ID: {{ orderId }}</p>
      <p>Thank you for your purchase.</p>
      <router-link to="/" class="btn btn-primary">Return to Home</router-link>
    </div>

    <div v-else class="failed">
      <h2>Payment Failed</h2>
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <p v-else>There was an issue processing your payment.</p>
      <p v-if="orderId">Order ID: {{ orderId }}</p>
      <button @click="retryPayment" class="btn btn-primary">Retry Payment</button>
      <router-link to="/cart" class="btn btn-secondary">Back to Cart</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBogPayment } from '@/services/bogPayment';

export default {
  name: 'PaymentStatusView',
  props: ['status', 'order_id', 'locale'],
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const errorMessage = ref('');
    const orderId = ref(props.order_id || route.query.order_id || '');
    const paymentVerificationResult = ref(null);

    const { getOrderDetails } = useBogPayment();

    // Computed property to determine if payment was successful based on verification result
    const isPaymentSuccessful = computed(() => {
      return paymentVerificationResult.value?.success === true;
    });

    const verifyPayment = async () => {
      if (!orderId.value) {
        errorMessage.value = 'No order ID found. Please contact support.';
        loading.value = false;
        return;
      }

      try {
        const result = await getOrderDetails(orderId.value);
        paymentVerificationResult.value = result;

        console.log('Payment verification result:', result);

        // If we're on the fail page but payment was actually successful
        if (route.path.includes('/fail') && result.success) {
          console.log('Redirecting from fail to success page');
          router.replace(`/payment/success?order_id=${orderId.value}`);
          return;
        }

        // If we're on the success page but payment failed
        if (route.path.includes('/success') && !result.success) {
          console.log('Redirecting from success to fail page');
          router.replace(`/payment/fail?order_id=${orderId.value}`);
          return;
        }

        if (!result.success) {
          errorMessage.value = result.message || 'Payment verification failed';
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        paymentVerificationResult.value = {
          success: false,
          message: 'Error verifying payment status. Please check your email for confirmation or contact support.'
        };
        errorMessage.value = 'Error verifying payment status. Please check your email for confirmation or contact support.';
      } finally {
        loading.value = false;
      }
    };

    const retryPayment = () => {
      if (orderId.value) {
        router.push(`/${props.locale || 'en'}/checkout?order_id=${orderId.value}`);
      } else {
        router.push('/cart');
      }
    };

    onMounted(() => {
      verifyPayment();
    });

    return {
      loading,
      errorMessage,
      orderId,
      retryPayment,
      isPaymentSuccessful,
      paymentVerificationResult
    };
  }
};
</script>

<style scoped>
.payment-status {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.success {
  color: #10b981;
}

.failed {
  color: #ef4444;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border-radius: 0.375rem;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>