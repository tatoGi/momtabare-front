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
import { computed, ref } from "vue"

const categoryStore = useCategoryStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const { files, open, reset, onCancel, onChange } = useFileDialog()

const uploadedImage = ref("")
const productName = ref('')
const productCategory = ref('')
const productPrice = ref('')
const productLocation = ref('')
const contactPerson = ref('')
const contactPhone = ref('')
const rentalPeriod = ref<Date[]>([])
const productDescription = ref('')
const productColor = ref('')
const productSize = ref('')
const productBrand = ref('')
const selectedCurrency = ref('GEL')
const isSubmitting = ref(false)
const formErrors = ref<Record<string, string>>({})
const isEditMode = computed(() => Boolean(route.query.editId))
const editingProductId = computed(() => Number(route.query.editId))

interface ISubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}

const submitStatus = ref<ISubmitStatus>({ type: null, message: '' })

onChange((selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    const file = selectedFiles[0]
    uploadedImage.value = URL.createObjectURL(file)
  }
})

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
  if (rentalPeriod.value.length === 2) {
    formData.append('rental_start_date', rentalPeriod.value[0].toISOString())
    formData.append('rental_end_date', rentalPeriod.value[1].toISOString())
  }
  if (productColor.value) formData.append('color', productColor.value)
  if (productSize.value) formData.append('size', productSize.value)
  if (productBrand.value) formData.append('brand', productBrand.value)
  
  // Image file
  if (files.value && files.value.length > 0) {
    formData.append('image', files.value[0])
  }

  try {
    const result = isEditMode.value
      ? await updateProduct(editingProductId.value, formData)
      : await addProduct(formData)
    if (result.success) {
      submitStatus.value = {
        type: 'success',
        message: result.message || (isEditMode.value ? 'პროდუქცია განახლებულია' : 'პროდუქცია წარმატებით დაემატა! ადმინისტრაციის მიერ განხილვის შემდეგ გამოქვეყნდება.')
      }
      // Redirect to user profile with success message after successful submission
      setTimeout(() => {
        if (isEditMode.value) {
          router.push({ name: 'my-listings' })
        } else {
          // Redirect to user profile with success message
          router.push({ 
            name: 'user', 
            query: { 
              success: 'true',
              message: 'პროდუქცია წარმატებით დაემატა! ადმინისტრაციის მიერ განხილვის შემდეგ გამოქვეყნდება.'
            }
          })
        }
        submitStatus.value = { type: null, message: '' }
      }, 2000) // Redirect after 2 seconds to show success message
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
  rentalPeriod.value = []
  productDescription.value = ''
  productColor.value = ''
  productSize.value = ''
  productBrand.value = ''
  selectedCurrency.value = 'gel'
  uploadedImage.value = ''
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
        rentalPeriod.value = [start, end]
      }
    }
    const imgUrl = p.image_url || p.main_image || p.thumbnail || (Array.isArray(p.images) ? p.images[0]?.url : '')
    if (imgUrl) {
      uploadedImage.value = imgUrl
    }
  } catch (e) {
    console.error('Failed to prefill product for edit:', e)
  }
}

prefillIfEdit()
</script>

<template>
  <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route />
  <main class="flex justify-between gap-28 pb-24 pt-3">
    <section class="w-full">
      <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
        დაამატე განცხადება
      </h2>
      
      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">პროდუქციის დასახელება</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის დასახელება
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Input v-model="productName" class="w-[452px]" placeholder="პროდუქციის დასახელება" />
          <p v-if="formErrors.name" class="text-sm text-red-500">{{ formErrors.name }}</p>
        </div>
      </div>

      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">აირჩიე კატეგორია</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            აირჩე კატეგორია რომელსაც მიეკუთვნება პროდუქცია
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <Select v-model="productCategory">
            <SelectTrigger class="w-[452px]">
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
          <p v-if="formErrors.category" class="text-sm text-red-500">{{ formErrors.category }}</p>
        </div>
      </div>

      <div
        class="flex items-start justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">საკონტაქტო ინფორმაცია</h2>
          <p
            class="max-w-[410px] text-sm text-customBlack/70 dark:text-white/70"
          >
            მიუთითეთ სად შეძლებს მქირავებელი პროდუქციის აღებას და ასევე ვის
            დაუკავშირდება
          </p>
        </div>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <Select v-model="productLocation">
              <SelectTrigger class="w-[452px]">
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
            <p v-if="formErrors.location" class="text-sm text-red-500">{{ formErrors.location }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Input v-model="contactPerson" class="w-[452px]" placeholder="საკონტაქტო პირი" />
            <p v-if="formErrors.contact_person" class="text-sm text-red-500">{{ formErrors.contact_person }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Input v-model="contactPhone" class="w-[452px]" placeholder="ტელეფონი" />
            <p v-if="formErrors.contact_phone" class="text-sm text-red-500">{{ formErrors.contact_phone }}</p>
          </div>
        </div>
      </div>

      <div
        class="flex items-start justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">პროდუქციის აღწერა</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            დაწერეთ პროდუქციის დეტალური აღწერა
          </p>
        </div>
        <textarea
          v-model="productDescription"
          class="w-[452px] h-[120px] rounded-xl border border-customBlack/10 p-4 text-sm text-customBlack/70 placeholder-customBlack/70 dark:text-white/70 resize-none"
          placeholder="პროდუქციის აღწერა..."
        ></textarea>
      </div>

      <div
        class="flex items-start justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">პროდუქციის მახასიათებლები</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის მახასიათებლები
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <Input v-model="productColor" class="w-[452px]" placeholder="ფერი (არასავალდებულო)" />
          <Input v-model="productSize" class="w-[452px]" placeholder="ზომა (არასავალდებულო)" />
          <Input v-model="productBrand" class="w-[452px]" placeholder="ბრენდი (არასავალდებულო)" />
        </div>
      </div>

      <div
        class="flex items-start justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">პროდუქციის ფოტო</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            ატვირთეთ პროდუქციის ფოტო
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <div
            v-if="uploadedImage"
            class="w-[452px] h-[200px] rounded-xl border border-customBlack/10 overflow-hidden"
          >
            <img :src="uploadedImage" alt="Uploaded product" class="w-full h-full object-cover" />
          </div>
          <BaseButton
            :height="48"
            class="w-[452px] border border-dashed border-customBlack/30 bg-transparent text-customBlack/70 dark:text-white/70"
            @click="open"
          >
            <BaseIcon name="upload" :size="20" class="mr-2" />
            ატვირთეთ ფოტო
          </BaseButton>
        </div>
      </div>

      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">ღირებულება</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ პროდუქციის გაქირავების ღირებულება
          </p>
        </div>
        <div
          class="flex w-[452px] items-center justify-between rounded-xl border border-customBlack/10 py-1.5 pl-5 pr-1.5"
        >
          <div class="flex flex-col gap-2 w-full">
            <input
              v-model="productPrice"
              class="text-sm text-customBlack/70 placeholder-customBlack/70 dark:text-white/70"
              placeholder="ღირებულება"
              type="number"
              min="0"
              step="0.01"
            />
            <p v-if="formErrors.price" class="text-sm text-red-500">{{ formErrors.price }}</p>
          </div>

          <div class="flex items-center">
            <div
              :class="
                selectedCurrency === 'GEL'
                  ? 'bg-customBlue text-white'
                  : 'text-customBlack/70'
              "
              class="flex-center h-[38px] cursor-pointer rounded-lg px-4 text-sm font-medium text-customBlack/70 dark:text-white/70"
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
              class="flex-center h-[38px] cursor-pointer rounded-lg px-4 text-sm font-medium"
              @click.left="selectCurrency('usd')"
            >
              USD
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">აირჩიე პერიოდი</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მიუთითე პერიოდი როდის აქირავებ
          </p>
        </div>
        <div class="w-[452px]">
          <VDatePicker
            v-model="rentalPeriod"
            is-range
            color="red"
            :placeholder="'აირჩიე პერიოდი'"
            style="width: 100%"
          />
        </div>
      </div>

      <div class="flex items-center justify-between py-8">
        <p
          class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70"
        >
          გასუფთავება
        </p>
        <BaseButton
          :height="48"
          :disabled="isSubmitting"
          class="font-uppercase bg-customRed px-5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          @click="triggerAddRetailerProduct"
        >
          <span v-if="isSubmitting">იტვირთება...</span>
          <span v-else>დაამატე პროდუქცია</span>
        </BaseButton>
      </div>
    </section>
    <section
      class="flex h-[236px] w-[420px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed"
      @click="open"
    >
      <template v-if="uploadedImage">
        <div class="h-full w-full overflow-hidden rounded-2xl">
          <img
            :src="uploadedImage"
            alt="Uploaded Image"
            class="h-full w-full object-cover"
          />
        </div>
      </template>
      <template v-else>
        <div class="flex-center h-16 w-16 rounded-full bg-customGrey">
          <BaseIcon :size="28" :weight="300" name="upload" />
        </div>
        <div class="flex flex-col items-center gap-1">
          <h2 class="text-sm font-medium">ატვირთე მთავარი სურათი</h2>
          <p class="text-xs text-customBlack/70 dark:text-white/70">
            მაქსიმალური ზომა 5მბ
          </p>
        </div>
      </template>
    </section>
  </main>
</template>
