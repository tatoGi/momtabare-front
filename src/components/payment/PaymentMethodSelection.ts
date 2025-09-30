import BaseButton from "@/components/base/BaseButton.vue"
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useBogPayment } from "@/services/bogPayment"
import type { ISavedCardSummary } from "@/ts/services/bogPayment.types"

export default {
  name: 'PaymentMethodSelection',
  components: {
    BaseButton
  },
  props: {
    cart: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const { processCheckout } = useBogPayment()
    
    const loading = ref(false)
    const saveCard = ref(false)
    const savedCards = ref<ISavedCardSummary[]>([])
    const selectedCard = ref<ISavedCardSummary | null>(null)

    const handlePayment = async () => {
      loading.value = true
      try {
        const response = await processCheckout(props.cart, saveCard.value, selectedCard.value)
        if (!response.success) {
          throw new Error(response.message || 'Payment failed')
        }
      } catch (error: any) {
        console.error('Payment error:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      saveCard,
      savedCards,
      selectedCard,
      handlePayment
    }
  }
}
