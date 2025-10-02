<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import BaseUploadInput from "@/components/base/BaseUploadInput.vue"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IUser } from "@/ts/models/user-types"
import { cities } from "@/constants/cities.ts"
import { useUserStore } from "@/pinia/user.pinia.ts"
import { computed, ref, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import { saveRetailerShop, getRetailerShop, type IRetailerShopData } from "@/services/retailer"
import { getUserProductsCount } from "@/services/userProducts"

const userStore = useUserStore()
const router = useRouter()

// Refs for form data
const avatarImage = ref<string | null>(null)
const coverImage = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const coverFile = ref<File | null>(null)

const retailerName = ref<string>("")
const retailerDescription = ref<string>("")
const retailerLocation = ref<string>("")
const userFullName = ref<string>("")
const userPhone = ref<string>("")
const isSubmitting = ref(false)
const productCount = ref<number>(0)
const isLoading = ref(false)
const isEditMode = ref(false)
const shopId = ref<number | null>(null)
interface ISubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
}

const submitStatus = ref<ISubmitStatus>({ type: null, message: '' })

const user = computed<IUser | null>(() => userStore.user)

// Handle file uploads
function handleImageUpload(files: FileList, type: string): void {
  const file = files[0]
  if (!file) return
  
  const imageUrl = URL.createObjectURL(file)
  
  if (type === "avatar") {
    avatarImage.value = imageUrl
    avatarFile.value = file
  } else if (type === "cover") {
    coverImage.value = imageUrl
    coverFile.value = file
  }
}

// Submit retailer shop form
const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  submitStatus.value = { type: null, message: '' }
  
  try {
    const shopData: IRetailerShopData = {
      name: retailerName.value,
      location: retailerLocation.value,
      contact_person: userFullName.value,
      contact_phone: userPhone.value,
      avatar: avatarFile.value,
      cover_image: coverFile.value
    }
    
    const result = await saveRetailerShop(shopData)
    
    if (result.success) {
      const successMessage = isEditMode.value 
        ? 'მაღაზიის ინფორმაცია წარმატებით განახლდა!' 
        : 'მაღაზიის ინფორმაცია წარმატებით შეინახა!'
      
      submitStatus.value = { 
        type: 'success', 
        message: successMessage
      }
      
      // Redirect to profile page after successful save
      setTimeout(() => {
        router.push('/user')
      }, 1500) // Wait 1.5 seconds to show success message
    } else {
      throw new Error(result.message || 'დაფიქსირდა შეცდომა')
    }
  } catch (error: any) {
    console.error('Failed to save retailer shop:', error)
    submitStatus.value = { 
      type: 'error', 
      message: error.message || 'მოხდა შეცდომა, გთხოვთ სცადოთ თავიდან'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Fetch and update product count
const fetchProductCount = async () => {
  try {
    if (!user.value?.id) return;
    
    const count = await getUserProductsCount(user.value.id);
    productCount.value = count;
    console.log('Retailer product count updated:', count);
  } catch (error) {
    console.error('Failed to fetch product count:', error);
    productCount.value = 0;
  }
}

// Computed property for product count display with Georgian pluralization
const productCountText = computed(() => {
  const count = productCount.value;
  if (count === 0) return '0 პროდუქცია';
  if (count === 1) return '1 პროდუქცია';
  return `${count} პროდუქცია`;
})

// Computed properties for dynamic text
const pageTitle = computed(() => isEditMode.value ? 'ჩემი მაღაზიის რედაქტირება' : 'ჩემი მაღაზია')
const submitButtonText = computed(() => isEditMode.value ? 'განახლება' : 'შენახვა')

// Fetch existing shop data
const fetchShopData = async () => {
  try {
    isLoading.value = true
    const result = await getRetailerShop()
    
    if (result.success && result.data) {
      const shop = result.data
      isEditMode.value = true
      shopId.value = shop.id
      
      // Pre-populate form fields
      retailerName.value = shop.name
      retailerLocation.value = shop.location
      userFullName.value = shop.contact_person
      userPhone.value = shop.contact_phone
      
      // Set image URLs if they exist - construct full URLs
      if (shop.avatar) {
        avatarImage.value = `${import.meta.env.VITE_BACKEND_URL}/storage/${shop.avatar}`
      }
      if (shop.cover_image) {
        coverImage.value = `${import.meta.env.VITE_BACKEND_URL}/storage/${shop.cover_image}`
      }
      
      // Set description if it exists
      if (shop.description) {
        retailerDescription.value = shop.description
      }
      
      console.log('Shop data loaded for editing:', shop)
    } else {
      // No existing shop, create mode
      isEditMode.value = false
      console.log('No existing shop found, create mode')
    }
  } catch (error) {
    console.error('Failed to fetch shop data:', error)
    isEditMode.value = false
  } finally {
    isLoading.value = false
  }
}

// Initialize data on component mount
onMounted(async () => {
  await fetchShopData()
  fetchProductCount()
})

watch(user, (value: IUser | null) => {
  if (!value?.first_name || !value?.last_name) return

  if (userFullName.value === "") {
    userFullName.value = `${value.first_name} ${value.last_name}`.trim()
  }
  
  // Fetch product count when user changes
  fetchProductCount();
}, { immediate: true })
</script>

<template>
  <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route />
  <main class="flex justify-between gap-28 pb-24 pt-3">
    <section class="w-full">
      <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
        {{ pageTitle }}
      </h2>
      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">ატვირთე Cover სურათი</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მაქსიმალური ზომა 5მბ
          </p>
        </div>
        <BaseUploadInput
          @file-change="(files) => handleImageUpload(files, 'cover')"
        />
      </div>

      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">ატვირთე Avatar სურათი</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მაქსიმალური ზომა 5მბ
          </p>
        </div>
        <BaseUploadInput
          @file-change="(files) => handleImageUpload(files, 'avatar')"
        />
      </div>

      <div
        class="flex items-center justify-between border-b border-customBlack/10 py-8"
      >
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">მაღაზიის დასახელება</h2>
          <p class="w-[410px] text-sm text-customBlack/70 dark:text-white/70">
            ამ დასახელებას დაინახავს მომხმარებელი, როდესაც თქვენ მაღაზიაში
            გადმოვა.
          </p>
        </div>
        <Input
          v-model="retailerName"
          class="w-[452px]"
          placeholder="დასახელება"
        />
      </div>

      <div class="flex items-start justify-between py-8">
        <div class="flex flex-col items-start">
          <h2 class="font-bold dark:text-white">საკონტაქტო ინფორმაცია</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            მიუთითეთ სად შეძლებს მქირავებელი პროდუქციის აღებას და ასევე ვის დაუკავშირდება
          </p>
        </div>
        <div class="flex flex-col gap-6">
          <Select v-model="retailerLocation">
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
          <Input
            v-model="userFullName"
            class="w-[452px]"
            placeholder="საკონტაქტო პირი"
          />
          <Input v-model="userPhone" class="w-[452px]" placeholder="ტელეფონი" />
        </div>
      </div>

      <div class="flex flex-col items-end gap-4">
        <div 
          v-if="submitStatus?.type"
          :class="{
            'text-green-600': submitStatus.type === 'success',
            'text-red-600': submitStatus.type === 'error'
          }"
          class="text-sm font-medium"
        >
          {{ submitStatus.message }}
        </div>
        <BaseButton
          :height="48"
          :disabled="isSubmitting"
          class="font-uppercase bg-customRed px-5 text-sm font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting">
            ინახება...
          </span>
          <span v-else>
            {{ submitButtonText }}
          </span>
        </BaseButton>
      </div>
    </section>
    <section
      class="relative h-[230px] w-[350px] overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <!-- Background Image with Overlay -->
      <div class="relative h-[140px] w-full">
        <img
          v-if="coverImage"
          :src="coverImage"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div v-else class="absolute inset-0 h-full w-full bg-gray-300"></div>
        
        <!-- Dark overlay for better text visibility -->
        <div class="absolute inset-0 bg-black/20"></div>
        
        <!-- Product Count Badge (Top Right) -->
        <div class="absolute right-3 top-3 rounded-full bg-customRed px-2.5 py-1">
          <span class="text-xs font-bold text-white">{{ productCountText }}</span>
        </div>
        
        <!-- Brand Logo (Bottom Left) -->
        <div class="absolute bottom-3 left-3 h-12 w-12 rounded-full bg-white p-1">
          <img
            v-if="avatarImage"
            :src="avatarImage"
            class="h-full w-full rounded-full object-cover"
          />
          <div v-else class="h-full w-full rounded-full bg-customRed"></div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="flex h-[90px] flex-col justify-center px-4 py-3">
        <!-- Retailer Name with Verification Badge -->
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-base font-semibold text-customBlack">{{ retailerName }}</h2>
          <BaseIcon
            :size="16"
            class="text-blue-500"
            name="verified"
          />
        </div>
        
        <!-- Location -->
        <div class="flex items-center gap-1">
          <BaseIcon
            v-show="retailerLocation"
            :size="14"
            class="text-customRed"
            name="location_on"
          />
          <p class="text-sm font-medium text-customRed">
            {{ retailerLocation }}
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
