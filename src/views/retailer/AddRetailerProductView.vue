<script lang="ts" setup>
import { useFileDialog } from "@vueuse/core"
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ICategory } from "@/types/category"
import { cities } from "@/constants/cities"
import { addProduct, updateProduct, getRetailerProduct } from "@/services/retailer"
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from "@/pinia/category.pinia"
import { useUserStore } from "@/pinia/user.pinia"
import { computed, ref, watch } from "vue"

const categoryStore = useCategoryStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const { files, open, reset, onCancel, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: true
})

const uploadedImages = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const productName = ref('')
const productCategory = ref('')
const productPrice = ref('')
const productLocation = ref('')
const contactPerson = ref('')
const contactPhone = ref('')
const rentalPeriod = ref<any>(null) // Changed to any to see what VDatePicker returns
const productDescription = ref('')
const productColor = ref('')
const productSize = ref('')
const productBrand = ref('')
const selectedCurrency = ref('GEL')
const isSubmitting = ref(false)
const formErrors = ref<Record<string, string>>({})
const isEditMode = computed(() => Boolean(route.query.editId))
const editingProductId = computed(() => Number(route.query.editId))

// Watch rental period changes to debug

interface ISubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}

const submitStatus = ref<ISubmitStatus>({ type: null, message: '' })

onChange((selectedFilesArray) => {
  if (selectedFilesArray && selectedFilesArray.length > 0) {
    selectedFiles.value = Array.from(selectedFilesArray)
    uploadedImages.value = selectedFiles.value.map(file => URL.createObjectURL(file))
  }
})

function removeImage(index: number) {
  uploadedImages.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

const categories = computed<ICategory[]>(() => categoryStore.getCategories || [])


function selectCurrency(currency: string): void {
  selectedCurrency.value = currency.toUpperCase()
}


function validateForm(): boolean {
  formErrors.value = {}
  
  // Required field validation
  if (!productName.value.trim()) {
    formErrors.value.name = 'პროდუქციის დასახელება აუცილებელია'
  }
  if (!productCategory.value) {
    formErrors.value.category = 'კატეგორიის არჩევა აუცილებელია'
  }
  if (!productPrice.value || parseFloat(productPrice.value) <= 0) {
    formErrors.value.price = 'ღირებულება უნდა იყოს დადებითი რიცხვი'
  }
  if (!productLocation.value) {
    formErrors.value.location = 'მდებარეობის არჩევა აუცილებელია'
  }
  if (!contactPerson.value.trim()) {
    formErrors.value.contact_person = 'საკონტაქტო პირი აუცილებელია'
  }
  if (!contactPhone.value.trim()) {
    formErrors.value.contact_phone = 'ტელეფონის ნომერი აუცილებელია'
  }
  
  return Object.keys(formErrors.value).length === 0
}

async function triggerAddRetailerProduct() {
  if (!validateForm()) {
    console.log('Form validation failed:', formErrors.value)
    return
  }
  // Check if user has retailer permissions
  const currentUser = userStore.user
  if (!currentUser) {
    console.error('❌ No user data found')
    alert('მომხმარებლის მონაცემები ვერ მოიძებნა')
    return
  }
  
  console.log('🏪 User retailer status:', currentUser.is_retailer)
  console.log('🏪 Retailer status field:', currentUser.retailer_status)

  isSubmitting.value = true
  
  const formData = new FormData()
  
  // Required fields
  formData.append('name', productName.value)
  formData.append('category_id', productCategory.value)
  formData.append('price', productPrice.value)
  formData.append('currency', selectedCurrency.value)
  formData.append('location', productLocation.value)
  formData.append('contact_person', contactPerson.value)
  formData.append('contact_phone', contactPhone.value)
  
  // Optional fields
  if (productDescription.value) formData.append('description', productDescription.value)
  
  console.log('═══════════════════════════════════════')
  console.log('🔍 CHECKING RENTAL PERIOD')
  console.log('═══════════════════════════════════════')
  console.log('Raw value:', rentalPeriod.value)
  console.log('Type:', typeof rentalPeriod.value)
  console.log('Is Array:', Array.isArray(rentalPeriod.value))
  console.log('Has .start:', rentalPeriod.value?.start)
  console.log('Has .end:', rentalPeriod.value?.end)
  console.log('Has length:', rentalPeriod.value?.length)
  console.log('Full JSON:', JSON.stringify(rentalPeriod.value))
  console.log('═══════════════════════════════════════')
  
  // Handle VDatePicker range object format
  if (rentalPeriod.value) {
    let startDate: string | null = null
    let endDate: string | null = null
    
    // Check if it's a range object with start/end properties
    if (rentalPeriod.value.start && rentalPeriod.value.end) {
      startDate = new Date(rentalPeriod.value.start).toISOString()
      endDate = new Date(rentalPeriod.value.end).toISOString()
      console.log('📅 Range Object Format - Sending to backend:', { startDate, endDate })
    }
    // Check if it's an array of dates
    else if (Array.isArray(rentalPeriod.value) && rentalPeriod.value.length === 2) {
      startDate = new Date(rentalPeriod.value[0]).toISOString()
      endDate = new Date(rentalPeriod.value[1]).toISOString()
      console.log('📅 Array Format - Sending to backend:', { startDate, endDate })
    }
    
    if (startDate && endDate) {
      formData.append('rental_start_date', startDate)
      formData.append('rental_end_date', endDate)
      console.log('✅ Rental dates added to FormData')
    } else {
      console.warn('⚠️ Rental period has data but could not parse dates:', rentalPeriod.value)
    }
  } else {
    console.warn('⚠️ Rental period NOT set - dates will be null')
  }
  
  if (productColor.value) formData.append('color', productColor.value)
  if (productSize.value) formData.append('size', productSize.value)
  if (productBrand.value) formData.append('brand', productBrand.value)
  
  // Multiple image files
  if (selectedFiles.value && selectedFiles.value.length > 0) {
    selectedFiles.value.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })
  }

  // Debug: Log all FormData entries
  console.log('📦 FormData being sent to backend:')
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`)
    } else {
      console.log(`  ${key}: ${value}`)
    }
  }

  try {
    const result = isEditMode.value
      ? await updateProduct(editingProductId.value, formData)
      : await addProduct(formData)
    if (result.success) {
      // Use SweetAlert2 for success message
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        icon: 'success',
        title: 'წარმატებული!',
        text: result.message || (isEditMode.value ? 'პროდუქცია განახლებულია' : 'პროდუქცია წარმატებით დაემატა! ადმინისტრაციის მიერ განხილვის შემდეგ გამოქვეყნდება.'),
        confirmButtonText: 'კარგი',
        confirmButtonColor: '#DC3545'
      })
      
      // Reset form and redirect
      if (isEditMode.value) {
        router.push({ name: 'my-listings' })
      } else {
        resetForm()
        router.push({ name: 'user' })
      }
    } else {
      submitStatus.value = {
        type: 'error',
        message: result.message || 'პროდუქციის დამატება ვერ მოხერხდა'
      }
    }
  } catch (error: any) {
    submitStatus.value = {
      type: 'error',
      message: error.message || 'მოხდა შეცდომა, გთხოვთ სცადოთ თავიდან'
    }
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  productName.value = ''
  productCategory.value = ''
  productPrice.value = ''
  productLocation.value = ''
  contactPerson.value = ''
  contactPhone.value = ''
  rentalPeriod.value = null // Changed to null to match VDatePicker
  productDescription.value = ''
  productColor.value = ''
  productSize.value = ''
  productBrand.value = ''
  selectedCurrency.value = 'gel'
  uploadedImages.value = []
  selectedFiles.value = []
  formErrors.value = {}
  reset() // Reset file dialog
}

// Prefill when in edit mode
async function prefillIfEdit() {
  if (!isEditMode.value || !editingProductId.value) return
  try {
    const resp = await getRetailerProduct(editingProductId.value)
    if (!resp.success || !resp.data) return
    const p = resp.data
    productName.value = p.title || p.name || ''
    productCategory.value = String(p.category_id || p.category?.id || '')
    productPrice.value = String(p.price || '')
    selectedCurrency.value = (p.currency || selectedCurrency.value || 'GEL').toUpperCase()
    productLocation.value = p.location || ''
    contactPerson.value = p.contact_person || ''
    contactPhone.value = p.contact_phone || ''
    productDescription.value = p.description || ''
    productColor.value = p.color || ''
    productSize.value = p.size || ''
    productBrand.value = p.brand || ''
    if (p.rental_start_date && p.rental_end_date) {
      const start = new Date(p.rental_start_date)
      const end = new Date(p.rental_end_date)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        // VDatePicker expects either an array or an object with start/end
        // Try array format first
        rentalPeriod.value = [start, end]
        console.log('📅 Prefilled rental period:', { start, end, value: rentalPeriod.value })
      }
    }
    const imgUrl = p.image_url || p.main_image || p.thumbnail || (Array.isArray(p.images) ? p.images[0]?.url : '')
    if (imgUrl) {
      uploadedImages.value = [imgUrl]
    } else if (Array.isArray(p.images) && p.images.length > 0) {
      uploadedImages.value = p.images.map((img: any) => img.url || img.image_name || '')
    }
  } catch (e) {
    console.error('Failed to prefill product for edit:', e)
  }
}

prefillIfEdit()
</script>

<template>
  <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route />
  <main class="flex flex-col lg:flex-row lg:justify-between lg:gap-28 pb-12 sm:pb-16 lg:pb-24 pt-2 sm:pt-3 px-4 sm:px-6 lg:px-0">
    <section class="w-full lg:w-full">
      <h2 class="font-uppercase text-lg sm:text-xl lg:text-2xl font-extrabold dark:text-white mb-4 sm:mb-6">
        დაამატე განცხადება
      </h2>
      
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">პროდუქციის დასახელება</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის დასახელება
          </p>
        </div>
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <Input v-model="productName" class="w-full sm:w-[452px]" placeholder="პროდუქციის დასახელება" />
          <p v-if="formErrors.name" class="text-xs text-red-500">{{ formErrors.name }}</p>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">აირჩიე კატეგორია</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            აირჩე კატეგორია რომელსაც მიეკუთვნება პროდუქცია
          </p>
        </div>
        <div class="flex flex-col gap-2 w-full sm:w-auto">
          <Select v-model="productCategory">
            <SelectTrigger class="w-full sm:w-[452px]">
              <SelectValue placeholder="აირჩიე კატეგორია" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl">
              <SelectGroup>
                <SelectItem
                  v-for="(category, index) in categories"
                  :key="category.id"
                  :class="{
                    'border-b border-b-customBlack/10':
                      index !== categories.length - 1,
                  }"
                  :value="category.id.toString()"
                  class="py-3"
                  >{{ category.name?.ka || category.title }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p v-if="formErrors.category" class="text-xs text-red-500">{{ formErrors.category }}</p>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start flex-shrink-0">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">საკონტაქტო ინფორმაცია</h2>
          <p
            class="max-w-[410px] text-xs sm:text-sm text-customBlack/70 dark:text-white/70"
          >
            მიუთითეთ სად შეძლებს მქირავებელი პროდუქციის აღებას და ასევე ვის
            დაუკავშირდება
          </p>
        </div>
        <div class="flex flex-col gap-4 w-full sm:w-auto">
          <div class="flex flex-col gap-2 w-full">
            <Select v-model="productLocation">
              <SelectTrigger class="w-full sm:w-[452px]">
                <SelectValue placeholder="აირჩიე მდებარეობა" />
              </SelectTrigger>
              <SelectContent class="rounded-2xl">
                <SelectGroup>
                  <SelectItem
                    v-for="(city, index) in cities"
                    :key="city + index"
                    :class="{
                      'border-b border-b-customBlack/10':
                        index !== cities.length - 1,
                    }"
                    :value="city"
                    class="py-3"
                    >{{ city }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p v-if="formErrors.location" class="text-xs text-red-500">{{ formErrors.location }}</p>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <Input v-model="contactPerson" class="w-full sm:w-[452px]" placeholder="საკონტაქტო პირი" />
            <p v-if="formErrors.contact_person" class="text-xs text-red-500">{{ formErrors.contact_person }}</p>
          </div>
          <div class="flex flex-col gap-2 w-full">
            <Input v-model="contactPhone" class="w-full sm:w-[452px]" placeholder="ტელეფონი" />
            <p v-if="formErrors.contact_phone" class="text-xs text-red-500">{{ formErrors.contact_phone }}</p>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start flex-shrink-0">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">პროდუქციის აღწერა</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            დაწერეთ პროდუქციის დეტალური აღწერა
          </p>
        </div>
        <textarea
          v-model="productDescription"
          class="w-full sm:w-[452px] h-[120px] rounded-xl border border-customBlack/10 p-3 sm:p-4 text-xs sm:text-sm text-customBlack/70 placeholder-customBlack/70 dark:text-white/70 dark:border-white/10 dark:bg-transparent resize-none"
          placeholder="პროდუქციის აღწერა..."
        ></textarea>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start flex-shrink-0">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">პროდუქციის მახასიათებლები</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის მახასიათებლები
          </p>
        </div>
        <div class="flex flex-col gap-3 w-full sm:w-auto">
          <Input v-model="productColor" class="w-full sm:w-[452px]" placeholder="ფერი (არასავალდებულო)" />
          <Input v-model="productSize" class="w-full sm:w-[452px]" placeholder="ზომა (არასავალდებულო)" />
          <Input v-model="productBrand" class="w-full sm:w-[452px]" placeholder="ბრენდი (არასავალდებულო)" />
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start flex-shrink-0">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">პროდუქციის ფოტო</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            ატვირთეთ პროდუქციის ფოტოები (მაქსიმუმ 10)
          </p>
        </div>
        <div class="flex flex-col gap-3 w-full sm:w-auto">
          <div v-if="uploadedImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-3">
            <div
              v-for="(image, index) in uploadedImages"
              :key="index"
              class="relative w-full h-[100px] sm:h-[120px] rounded-lg border border-customBlack/10 overflow-hidden group"
            >
              <img :src="image" alt="Product image" class="w-full h-full object-cover" />
              <button
                @click.stop="removeImage(index)"
                class="absolute top-1 right-1 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <BaseIcon name="close" :size="16" />
              </button>
            </div>
          </div>
          <BaseButton
            v-if="uploadedImages.length < 10"
            :height="44"
            class="w-full border border-dashed border-customBlack/30 bg-transparent text-xs sm:text-sm text-customBlack/70 dark:text-white/70 dark:border-white/30"
            @click="open"
          >
            <BaseIcon name="upload" :size="18" class="mr-2" />
            {{ uploadedImages.length > 0 ? 'დაამატე კიდევ ფოტო' : 'ატვირთეთ ფოტოები' }}
          </BaseButton>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">ღირებულება</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის გაქირავების ღირებულება
          </p>
        </div>
        <div
          class="flex w-full sm:w-[452px] items-center justify-between rounded-xl border border-customBlack/10 dark:border-white/10 py-1.5 pl-3 sm:pl-5 pr-1.5"
        >
          <div class="flex flex-col gap-2 w-full">
            <input
              v-model="productPrice"
              class="text-xs sm:text-sm text-customBlack/70 placeholder-customBlack/70 dark:text-white/70 dark:placeholder-white/70 dark:bg-transparent w-full"
              placeholder="ღირებულება"
              type="number"
              min="0"
              step="0.01"
            />
            <p v-if="formErrors.price" class="text-xs text-red-500">{{ formErrors.price }}</p>
          </div>

          <div class="flex items-center gap-1">
            <div
              :class="
                selectedCurrency === 'GEL'
                  ? 'bg-customBlue text-white'
                  : 'text-customBlack/70'
              "
              class="flex-center h-[36px] sm:h-[38px] cursor-pointer rounded-lg px-2 sm:px-4 text-xs sm:text-sm font-medium text-customBlack/70 dark:text-white/70 transition-colors"
              @click.left="selectCurrency('gel')"
            >
              GEL
            </div>
            <div
              :class="
                selectedCurrency === 'USD'
                  ? 'bg-customBlue text-white'
                  : 'text-customBlack/70'
              "
              class="flex-center h-[36px] sm:h-[38px] cursor-pointer rounded-lg px-2 sm:px-4 text-xs sm:text-sm font-medium transition-colors"
              @click.left="selectCurrency('usd')"
            >
              USD
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-customBlack/10 py-6 sm:py-8 gap-4 sm:gap-6"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white text-base sm:text-lg">აირჩიე პერიოდი</h2>
          <p class="text-xs sm:text-sm text-customBlack/70 dark:text-white/70">
            მიუთითე პერიოდი როდის აქირავებ
          </p>
        </div>
        <div class="w-full sm:w-[452px]">
          <VDatePicker
            v-model="rentalPeriod"
            is-range
            color="red"
            :placeholder="'აირჩიე პერიოდი'"
            style="width: 100%"
          />
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 sm:py-8 gap-4 sm:gap-6">
        <p
          class="cursor-pointer text-xs sm:text-sm font-medium text-customBlack/70 dark:text-white/70"
        >
          გასუფთავება
        </p>
        <BaseButton
          :height="44"
          :disabled="isSubmitting"
          class="font-uppercase bg-customRed px-4 sm:px-5 text-xs sm:text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          @click="triggerAddRetailerProduct"
        >
          <span v-if="isSubmitting">იტვირთება...</span>
          <span v-else>დაამატე პროდუქცია</span>
        </BaseButton>
      </div>
    </section>

    <!-- RIGHT SIDEBAR: Image preview (hide on mobile, show on lg+) -->
    <section
      class="hidden lg:flex max-h-[236px] w-full lg:w-[420px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed flex-shrink-0 mt-6 lg:mt-0"
      @click="open"
    >
      <template v-if="uploadedImages.length > 0">
        <div class="w-full h-full p-3 sm:p-4">
          <div class="grid grid-cols-2 gap-2 w-full">
            <div
              v-for="(image, index) in uploadedImages.slice(0, 4)"
              :key="index"
              class="relative w-full h-[80px] sm:h-[100px] overflow-hidden rounded-lg"
            >
              <img
                :src="image"
                alt="Uploaded Image"
                class="h-full w-full object-cover"
              />
            </div>
          </div>
          <p v-if="uploadedImages.length > 4" class="text-center text-xs sm:text-sm text-customBlack/70 dark:text-white/70 mt-2">
            +{{ uploadedImages.length - 4 }} სურათი
          </p>
        </div>
      </template>
      <template v-else>
        <div class="flex-center h-12 sm:h-16 w-12 sm:w-16 rounded-full bg-customGrey">
          <BaseIcon :size="24" :weight="300" name="upload" />
        </div>
        <div class="flex flex-col items-center gap-1">
          <h2 class="text-xs sm:text-sm font-medium">ატვირთე სურათები</h2>
          <p class="text-xs text-customBlack/70 dark:text-white/70">
            მაქსიმალური ზომა 5მბ თითო სურათისთვის
          </p>
        </div>
      </template>
    </section>
  </main>
</template>
