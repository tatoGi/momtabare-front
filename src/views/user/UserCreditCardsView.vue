<script lang="ts" setup>
import BaseIcon from "@/components/base/BaseIcon.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import CreditCard from "@/components/user/CreditCard.vue"
import { Input } from "@/components/ui/input"
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { listCards, addCard, deleteCard, setDefaultCard, type Card } from "@/services/cards"

const router = useRouter()
const cards = ref<Card[]>([])
const isLoading = ref(false)
const showAddDialog = ref(false)
const isSubmitting = ref(false)

// Form fields
const cardNumber = ref('')
const cardHolderName = ref('')
const expiryMonth = ref('')
const expiryYear = ref('')
const cvv = ref('')
const cardType = ref('')

// Form errors
const formErrors = ref<Record<string, string>>({})

// Computed
const hasCards = computed(() => cards.value.length > 0)

// Load cards on mount
onMounted(async () => {
  await loadCards()
})

async function loadCards() {
  isLoading.value = true
  try {
    const result = await listCards()
    if (result.success && result.cards) {
      cards.value = result.cards
    }
  } catch (error) {
    console.error('Failed to load cards:', error)
  } finally {
    isLoading.value = false
  }
}

function openAddDialog() {
  resetForm()
  showAddDialog.value = true
}

function closeAddDialog() {
  showAddDialog.value = false
  resetForm()
}

function resetForm() {
  cardNumber.value = ''
  cardHolderName.value = ''
  expiryMonth.value = ''
  expiryYear.value = ''
  cvv.value = ''
  cardType.value = ''
  formErrors.value = {}
}

function validateForm(): boolean {
  formErrors.value = {}
  
  // Card number validation
  const cleanCardNumber = cardNumber.value.replace(/\s/g, '')
  if (!cleanCardNumber) {
    formErrors.value.cardNumber = 'ბარათის ნომერი აუცილებელია'
  } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    formErrors.value.cardNumber = 'ბარათის ნომერი უნდა იყოს 13-19 ციფრი'
  }
  
  // Card holder name validation
  if (!cardHolderName.value.trim()) {
    formErrors.value.cardHolderName = 'მფლობელის სახელი აუცილებელია'
  }
  
  // Expiry month validation
  if (!expiryMonth.value) {
    formErrors.value.expiryMonth = 'თვე აუცილებელია'
  }
  
  // Expiry year validation
  if (!expiryYear.value) {
    formErrors.value.expiryYear = 'წელი აუცილებელია'
  } else {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const year = parseInt(expiryYear.value)
    const month = parseInt(expiryMonth.value)
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      formErrors.value.expiryYear = 'ბარათს ვადა გაუვიდა'
    }
  }
  
  // CVV validation
  if (!cvv.value) {
    formErrors.value.cvv = 'CVV აუცილებელია'
  } else if (!/^\d{3}$/.test(cvv.value)) {
    formErrors.value.cvv = 'CVV უნდა იყოს 3 ციფრი'
  }
  
  return Object.keys(formErrors.value).length === 0
}

async function handleAddCard() {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    console.log('🔵 Submitting card data...')
    
    const result = await addCard({
      card_number: cardNumber.value.replace(/\s/g, ''),
      card_holder_name: cardHolderName.value.trim(),
      expiry_month: expiryMonth.value.padStart(2, '0'),
      expiry_year: expiryYear.value,
      cvv: cvv.value,
      card_type: cardType.value || undefined
    })
    
    console.log('📦 Result from addCard:', result)
    
    if (result.success) {
      console.log('✅ Card added successfully')
      // Show success alert
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'success',
        title: 'წარმატებული!',
        text: result.message || 'ბარათი დამატებულია',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#DC3545'
      })
      
      closeAddDialog()
      await loadCards()
    } else {
      console.error('❌ Failed to add card:', result)
      
      // Check if it's an authentication error
      if (result.error?.type === 'auth_redirect') {
        const Swal = (await import('sweetalert2')).default
        await Swal.fire({
          icon: 'warning',
          title: 'გთხოვთ გაიაროთ ავტორიზაცია!',
          text: 'თქვენი სესია ამოიწურა. გთხოვთ თავიდან შეხვიდეთ სისტემაში.',
          confirmButtonText: 'კარგი',
          confirmButtonColor: '#DC3545'
        })
        // Redirect to home or login
        router.push('/')
        return
      }
      
      // Show error alert with detailed message
      const Swal = (await import('sweetalert2')).default
      
      let errorMessage = result.message || 'ბარათის დამატება ვერ მოხერხდა'
      
      // If there's a validation error object, show it
      if (result.error && typeof result.error === 'object') {
        const errors = result.error.errors || result.error
        if (errors) {
          const errorDetails = Object.values(errors).flat().join('\n')
          errorMessage += '\n\n' + errorDetails
        }
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'შეცდომა!',
        text: errorMessage,
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#DC3545'
      })
    }
  } catch (error: any) {
    console.error('💥 Exception in handleAddCard:', error)
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'error',
      title: 'შეცდომა!',
      text: error.message || 'მოხდა შეცდომა, გთხოვთ სცადოთ თავიდან',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#DC3545'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteCard(cardId: number) {
  const Swal = (await import('sweetalert2')).default
  const result = await Swal.fire({
    title: 'დარწმუნებული ხართ?',
    text: 'გსურთ ბარათის წაშლა?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'დიახ, წაშლა',
    cancelButtonText: 'გაუქმება',
    confirmButtonColor: '#DC3545',
    cancelButtonColor: '#6c757d'
  })
  
  if (result.isConfirmed) {
    const deleteResult = await deleteCard(cardId)
    if (deleteResult.success) {
      await Swal.fire({
        icon: 'success',
        title: 'წაშლილია!',
        text: deleteResult.message || 'ბარათი წაშლილია',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#DC3545'
      })
      await loadCards()
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'შეცდომა!',
        text: deleteResult.message || 'ბარათის წაშლა ვერ მოხერხდა',
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#DC3545'
      })
    }
  }
}

async function handleSetDefault(cardId: number) {
  const result = await setDefaultCard(cardId)
  if (result.success) {
    const Swal = (await import('sweetalert2')).default
    await Swal.fire({
      icon: 'success',
      title: 'წარმატებული!',
      text: result.message || 'მთავარი ბარათი განახლებულია',
      confirmButtonText: 'კარგი',
      confirmButtonColor: '#DC3545',
      timer: 2000
    })
    await loadCards()
  }
}

// Format card number input with spaces
function formatCardNumber() {
  const value = cardNumber.value.replace(/\s/g, '')
  const formatted = value.match(/.{1,4}/g)?.join(' ') || value
  cardNumber.value = formatted
}

// Generate year options (current year + 15 years)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let i = 0; i < 15; i++) {
    years.push(String(currentYear + i))
  }
  return years
})

// Get card gradient based on card type
function getCardGradient(type: string): string {
  const gradients: Record<string, string> = {
    visa: 'from-blue-600 via-blue-700 to-blue-900',
    mastercard: 'from-red-600 via-orange-600 to-red-800',
    amex: 'from-blue-900 via-indigo-800 to-blue-950',
    bog: 'from-green-600 via-emerald-700 to-green-900',
    other: 'from-gray-700 via-gray-800 to-gray-900'
  }
  return gradients[type] || 'from-slate-700 via-slate-800 to-slate-900'
}
</script>

<template>
  <main class="pt-8 pb-20 flex flex-col gap-7">
    <BaseBreadcrumbs :path="['ჩემი პროფილი', 'ბარათები']" disable-route />
    
    <div class="flex items-center justify-between">
      <h2 class="text-customBlack dark:text-white text-xl font-extrabold font-uppercase">
        ჩემი ბარათები
      </h2>
    </div>

    <div v-if="isLoading" class="flex-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-customRed"></div>
    </div>

    <div v-else class="grid grid-cols-4 gap-7">
      <!-- Add Card Button -->
      <div
        @click="openAddDialog"
        class="h-[148px] border border-customRed border-dashed rounded-2xl flex-center flex-col cursor-pointer hover:bg-customRed/5 transition-colors"
      >
        <BaseIcon :size="24" class="text-customRed" name="add" rounded />
        <p class="text-customRed text-sm font-semibold">დაამატე ბარათი</p>
      </div>

      <!-- User Cards -->
      <CreditCard
        v-for="card in cards"
        :key="card.id"
        :card-id="card.id"
        :payment-service="card.card_type"
        :last-numbers="card.card_mask.replace('****', '')"
        :expiry-month="card.expiry_month"
        :expiry-year="card.expiry_year"
        :is-default="card.is_default"
        :card-holder-name="card.card_holder_name"
        @delete="handleDeleteCard"
        @set-default="handleSetDefault"
      />
    </div>

    <!-- Empty state -->
    <div v-if="!isLoading && !hasCards" class="flex-center flex-col py-20 gap-4">
      <BaseIcon :size="64" class="text-gray-300 dark:text-gray-600" name="credit_card" />
      <p class="text-gray-500 dark:text-gray-400">თქვენ ჯერ არ გაქვთ დამატებული ბარათები</p>
      <BaseButton @click="openAddDialog" variant="primary">
        დაამატე ბარათი
      </BaseButton>
    </div>

    <!-- Add Card Dialog -->
    <Dialog :open="showAddDialog" @update:open="showAddDialog = $event">
      <DialogContent class="sm:max-w-[600px] max-h-[95vh] overflow-y-auto p-0">
        <div class="p-6 sm:p-8">
        <DialogHeader class="space-y-3 pb-5 border-b dark:border-gray-700">
          <div class="flex items-center gap-4">
            <div class="flex-center w-14 h-14 rounded-2xl bg-gradient-to-br from-customRed to-red-600 shadow-lg">
              <BaseIcon :size="28" name="credit_card" class="text-white" />
            </div>
            <div>
              <DialogTitle class="text-2xl font-bold dark:text-white">ახალი ბარათის დამატება</DialogTitle>
              <DialogDescription class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                შეიყვანეთ ბარათის დეტალები უსაფრთხოდ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="flex flex-col gap-6 py-8">
     
          <!-- Card Number -->
          <div class="flex flex-col gap-2.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div class="flex-center w-7 h-7 rounded-lg bg-customRed/10">
                <BaseIcon :size="18" name="credit_card" class="text-customRed" />
              </div>
              ბარათის ნომერი
              <span class="text-red-500 text-base">*</span>
            </label>
            <Input
              v-model="cardNumber"
              @input="formatCardNumber"
              placeholder="1234 5678 9012 3456"
              maxlength="23"
              class="text-lg font-mono h-14 px-4 border-2 transition-all duration-200 focus:border-customRed focus:ring-2 focus:ring-customRed/20 rounded-xl"
              :class="{ 'border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10': formErrors.cardNumber }"
            />
            <p v-if="formErrors.cardNumber" class="text-xs text-red-500 flex items-center gap-1 animate-shake">
              <BaseIcon :size="14" name="error" />
              {{ formErrors.cardNumber }}
            </p>
          </div>

          <!-- Card Holder Name -->
          <div class="flex flex-col gap-2.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div class="flex-center w-7 h-7 rounded-lg bg-customRed/10">
                <BaseIcon :size="18" name="person" class="text-customRed" />
              </div>
              მფლობელის სახელი
              <span class="text-red-500 text-base">*</span>
            </label>
            <Input
              v-model="cardHolderName"
              placeholder="JOHN DOE"
              class="text-lg uppercase h-14 px-4 border-2 transition-all duration-200 focus:border-customRed focus:ring-2 focus:ring-customRed/20 rounded-xl"
              :class="{ 'border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10': formErrors.cardHolderName }"
            />
            <p v-if="formErrors.cardHolderName" class="text-xs text-red-500 flex items-center gap-1 animate-shake">
              <BaseIcon :size="14" name="error" />
              {{ formErrors.cardHolderName }}
            </p>
          </div>

          <!-- Expiry Date and CVV -->
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-2.5">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <BaseIcon :size="18" name="calendar_month" class="text-customRed" />
                თვე
                <span class="text-red-500 text-base">*</span>
              </label>
              <Select v-model="expiryMonth">
                <SelectTrigger 
                  class="h-14 text-lg border-2 transition-all duration-200 focus:border-customRed rounded-xl"
                  :class="{ 'border-red-500 bg-red-50 dark:bg-red-900/10': formErrors.expiryMonth }"
                >
                  <SelectValue placeholder="MM" class="font-mono" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="month in 12" :key="month" :value="String(month).padStart(2, '0')" class="font-mono text-lg py-3">
                    {{ String(month).padStart(2, '0') }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="formErrors.expiryMonth" class="text-xs text-red-500 animate-shake">
                {{ formErrors.expiryMonth }}
              </p>
            </div>

            <div class="flex flex-col gap-2.5">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                <BaseIcon :size="18" name="event" class="text-customRed" />
                წელი
                <span class="text-red-500 text-base">*</span>
              </label>
              <Select v-model="expiryYear">
                <SelectTrigger 
                  class="h-14 text-lg border-2 transition-all duration-200 focus:border-customRed rounded-xl"
                  :class="{ 'border-red-500 bg-red-50 dark:bg-red-900/10': formErrors.expiryYear }"
                >
                  <SelectValue placeholder="YYYY" class="font-mono" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="year in yearOptions" :key="year" :value="year" class="font-mono text-lg py-3">
                    {{ year }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="formErrors.expiryYear" class="text-xs text-red-500 animate-shake">
                {{ formErrors.expiryYear }}
              </p>
            </div>

            <div class="flex flex-col gap-2.5">
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <BaseIcon :size="18" name="lock" class="text-customRed" />
                  CVV
                  <span class="text-red-500 text-base">*</span>
                </div>
                <div class="group relative">
                  <BaseIcon 
                    :size="16" 
                    name="info" 
                    class="text-gray-400 cursor-help hover:text-customRed transition-colors" 
                  />
                  <div class="invisible group-hover:visible absolute right-0 top-6 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-48 z-50 shadow-xl">
                    3 ციფრი ბარათის უკანა მხარეზე
                    <div class="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                  </div>
                </div>
              </label>
              <Input
                v-model="cvv"
                type="password"
                placeholder="•••"
                maxlength="3"
                class="text-base font-mono text-center h-12 border-2 transition-all duration-200 focus:border-customRed focus:ring-2 focus:ring-customRed/20"
                :class="{ 'border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10': formErrors.cvv }"
              />
              <p v-if="formErrors.cvv" class="text-xs text-red-500 animate-shake">
                {{ formErrors.cvv }}
              </p>
            </div>
          </div>

          <!-- Card Type (Optional) -->
          <div class="flex flex-col gap-2.5">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <div class="flex-center w-7 h-7 rounded-lg bg-customRed/10">
                <BaseIcon :size="18" name="label" class="text-customRed" />
              </div>
              ბარათის ტიპი 
              <span class="text-xs text-gray-400 dark:text-gray-500 font-normal">(არასავალდებულო)</span>
            </label>
            <Select v-model="cardType">
              <SelectTrigger class="h-14 text-lg border-2 transition-all duration-200 focus:border-customRed rounded-xl">
                <SelectValue placeholder="აირჩიეთ ტიპი" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">VISA</div>
                    <span class="font-semibold text-base">Visa</span>
                  </div>
                </SelectItem>
                <SelectItem value="mastercard">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-12 h-8 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                      <div class="flex -space-x-2">
                        <div class="w-3.5 h-3.5 bg-red-500 rounded-full"></div>
                        <div class="w-3.5 h-3.5 bg-orange-400 rounded-full"></div>
                      </div>
                    </div>
                    <span class="font-semibold text-base">Mastercard</span>
                  </div>
                </SelectItem>
                <SelectItem value="amex">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-12 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-[10px] shadow-md">AMEX</div>
                    <span class="font-semibold text-base">American Express</span>
                  </div>
                </SelectItem>
                <SelectItem value="bog">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-12 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">BOG</div>
                    <span class="font-semibold text-base">Bank of Georgia</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-12 h-8 bg-gray-500 rounded-lg flex items-center justify-center shadow-md">
                      <BaseIcon :size="18" name="credit_card" class="text-white" />
                    </div>
                    <span class="font-semibold text-base">სხვა</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Security Notice -->
          <div class="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex gap-4">
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-300/20 dark:bg-blue-700/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div class="relative flex-shrink-0 flex-center w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl shadow-lg">
              <BaseIcon :size="20" name="lock" class="text-white" />
            </div>
            <div class="relative flex flex-col gap-1.5">
              <p class="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                უსაფრთხო შენახვა
                <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold rounded-full">256-bit SSL</span>
              </p>
              <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                თქვენი ბარათის ინფორმაცია დაშიფრული სახით ინახება. სრული ნომრის შენახვა არ ხდება, 
                მხოლოდ უკანასკნელი 4 ციფრი და უსაფრთხო ტოკენი.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter class="gap-4 pt-6 border-t-2 dark:border-gray-700">
          <BaseButton 
            @click="closeAddDialog" 
            variant="outline" 
            :disabled="isSubmitting"
            class="flex-1 h-14 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 rounded-xl"
          >
            <BaseIcon :size="20" name="close" class="mr-2" />
            გაუქმება
          </BaseButton>
          <BaseButton 
            @click="handleAddCard" 
            :disabled="isSubmitting"
            class="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-customRed to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BaseIcon 
              v-if="isSubmitting" 
              :size="20" 
              name="sync" 
              class="animate-spin mr-2" 
            />
            <BaseIcon 
              v-else
              :size="20" 
              name="add_card" 
              class="mr-2" 
            />
            {{ isSubmitting ? 'მიმდინარეობს...' : 'დამატება' }}
          </BaseButton>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </main>
</template>
