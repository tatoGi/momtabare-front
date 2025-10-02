<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
// @ts-ignore - Vue SFC default export inference
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import { useUserStore } from "@/pinia/user.pinia"
import { getProductsByUser } from "@/services/products"
import { deleteProduct as deleteRetailerProduct } from "@/services/retailer"
import type { IProductListItem } from "@/ts/models/product.types"
import { ENV } from '@/utils/config/env'
import Swal from 'sweetalert2'

const router = useRouter()
const userStore = useUserStore()
const isLoading = ref(true)
const products = ref<IProductListItem[]>([])
// Status filter tabs (keys should match backend product.status values when possible)
type StatusKey = 'all' | 'approved' | 'draft' | 'disabled' | 'pending'
const statusTabs: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'ყველა' },
  { key: 'approved', label: 'აქტიური' },
  { key: 'draft', label: 'დრაფტი' },
  { key: 'disabled', label: 'დაიბლოკა' },
  { key: 'pending', label: 'მომლოდინე' }
]
const activeTab = ref<StatusKey>('all')

const filteredProducts = computed(() => {
  if (activeTab.value === 'all') return products.value

  return products.value.filter(p => normalizeStatus((p as any).status) === activeTab.value)
})

// Helper function to construct image URLs
const getImageUrl = (imageUrl?: string) => {
  console.log('getImageUrl called with:', imageUrl)
  if (!imageUrl) {
    console.log('No imageUrl provided, using placeholder')
    return '/img/itemplaceholder.png'
  }
  const fullUrl = `${ENV.BACKEND_URL}/storage/products/${imageUrl}`
  console.log('Generated image URL:', fullUrl)
  return fullUrl
}

// Normalize various backend status values to our UI keys
const normalizeStatus = (status: any): StatusKey => {
  const value = String(status || '').toLowerCase()
  if (['approved', 'active', 'published', 'enabled'].includes(value)) return 'approved'
  if (['pending', 'pedding', 'awaiting', 'waiting'].includes(value)) return 'pending'
  if (['draft'].includes(value)) return 'draft'
  if (['disabled', 'blocked', 'inactive', 'banned'].includes(value)) return 'disabled'
  return 'all'
}

const getStatus = (item: IProductListItem | any): StatusKey => {
  return normalizeStatus(item?.status)
}

const statusLabelMap: Record<StatusKey, string> = {
  all: 'სტატუსი',
  approved: 'აქტიური',
  pending: 'მომლოდინე',
  draft: 'დრაფტი',
  disabled: 'დაიბლოკა'
}

const getStatusLabel = (item: IProductListItem | any): string => {
  return statusLabelMap[getStatus(item)] || 'სტატუსი'
}

const formatDate = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  // Format as DD MMM (ka)
  const day = d.getDate().toString().padStart(2, '0')
  const month = d.toLocaleString('ka-GE', { month: 'short' })
  return `${day} ${month}`
}

const formatPeriod = (item: any): string => {
  const start = formatDate(item?.rental_start_date)
  const end = formatDate(item?.rental_end_date)
  if (start && end) return `${start} - ${end}`
  if (start) return start
  if (end) return end
  return '—'
}

const fetchUserProducts = async () => {
  try {
    isLoading.value = true
    if (userStore.user?.id) {
      const response = await getProductsByUser(userStore.user.id)
      products.value = response.data || []
    }
  } catch (error) {
    console.error('Error fetching user products:', error)
  } finally {
    isLoading.value = false
  }
}

const navigateToProduct = (product: IProductListItem) => {
  // Use slug route; fallback to sku if needed
  const productSku = (product as any).slug || (product as any).sku || String(product.id)
  router.push({ name: 'product', params: { productSku } })
}

const editProduct = (productId: number) => {
  // Navigate to existing route; AddRetailerProduct may support editing via query
  router.push({ name: 'addRetailerProduct', query: { editId: String(productId) } })
}

const toggleVisibility = (product: IProductListItem) => {
  // TODO: Integrate with backend visibility toggle when available
  console.warn('Visibility toggle not implemented yet for product', product.id)
}

const deleteProduct = async (productId: number) => {
  
  const confirmed = await Swal.fire({
    title: 'დარწმუნებული ხართ?',
    text: 'გსურთ პროდუქტის წაშლა?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'წაშლა',
    cancelButtonText: 'გაუქმება'
  })
  if (!confirmed.isConfirmed) return

  const result = await deleteRetailerProduct(productId)
  if (result.success) {
    products.value = products.value.filter(p => p.id !== productId)
    await Swal.fire({
      icon: 'success',
      title: 'წაშლილია',
      text: result.message || 'პროდუქტი წარმატებით წაიშალა!',
      confirmButtonColor: '#3085d6'
    })
  } else {
    await Swal.fire({
      icon: 'error',
      title: 'წაშლა ვერ მოხერხდა',
      text: result.message || 'პროდუქტის წაშლა ვერ მოხერხდა.',
      confirmButtonColor: '#d33'
    })
  }
}

onMounted(() => {
  fetchUserProducts()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Breadcrumbs -->
    <BaseBreadcrumbs class="mb-4" />

    <!-- Title -->
    <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
      ჩემი განცხადებები
    </h1>

    <!-- Tabs -->
    <div class="w-full overflow-x-auto">
      <div class="inline-flex gap-2 bg-gray-100/70 dark:bg-zinc-800 p-1 rounded-full mb-6">
        <button
          v-for="tab in statusTabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-transform"
          :class="activeTab === tab.key
            ? 'bg-white dark:bg-zinc-900 text-[#F44000] shadow'
            : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-zinc-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-0 overflow-hidden">
      <!-- Header row -->
      <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-sm text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-zinc-800">
        <div class="col-span-6">პროდუქცია</div>
        <div class="col-span-2">პერიოდი</div>
        <div class="col-span-2">ღირებულება</div>
        <div class="col-span-2 text-right">სტატუსი</div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="p-6 text-center text-gray-500 dark:text-gray-300">
        იტვირთება...
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredProducts.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-300">
        პროდუქტები ვერ მოიძებნა.
      </div>

      <!-- List -->
      <ul v-else class="divide-y divide-gray-200 dark:divide-zinc-800">
        <li
          v-for="item in filteredProducts"
          
          :key="item.id"
          class="px-4 md:px-6 py-4 md:grid md:grid-cols-12 md:gap-4 items-center"
        >
          <!-- Product cell -->
          <div class="col-span-6 flex items-start gap-4">
            <img
              :src="getImageUrl(item.images?.[0]?.url)"
              alt="thumb"
              class="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div class="min-w-0">
              <h3 class="text-sm md:text-base font-semibold text-gray-900 dark:text-white truncate">
                {{ item.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <!-- Stars -->
                <div class="flex text-[#F44000]">
                  <svg v-for="i in 5" :key="i" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.167L12 18.896l-7.336 3.868 1.402-8.167L.132 9.21l8.2-1.192z"/>
                  </svg>
                </div>
                <span class="text-xs text-gray-500">({{ item.ratings_amount }})</span>
              </div>
            </div>
          </div>

          <!-- Period cell -->
          <div class="col-span-2 hidden md:block text-gray-700 dark:text-gray-200">
            <span class="text-sm">{{ formatPeriod(item) }}</span>
          </div>

          <!-- Price cell -->
          <div class="col-span-2 hidden md:block">
            <span class="text-[#F44000] font-bold">{{ Number(item.price).toFixed(2) }} ₾</span>
            <span class="text-sm text-gray-500"> / დღეში</span>
          </div>

          <!-- Status + Actions -->
          <div class="col-span-2 mt-3 md:mt-0 md:text-right flex md:block items-center justify-between gap-4">
            <span
              class="inline-flex items-center gap-2 text-sm"
              :class="{
                'text-green-600': getStatus(item) === 'approved',
                'text-yellow-600': getStatus(item) === 'pending',
                'text-gray-600': getStatus(item) === 'draft',
                'text-red-600': getStatus(item) === 'disabled'
              }"
            >
              <span class="hidden md:inline">{{ getStatusLabel(item) }}</span>
            </span>

            <div class="flex items-center gap-3 md:justify-end">
              <!-- View -->
              <button @click="navigateToProduct(item)" class="text-gray-500 hover:text-gray-700" title="ნახვა">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10z"/></svg>
              </button>
              <!-- Edit -->
              <button @click="editProduct(item.id)" class="text-gray-500 hover:text-gray-700" title="რედაქტირება">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg>
              </button>
              <!-- Hide/Show -->
              <button @click="toggleVisibility(item)" class="text-gray-500 hover:text-gray-700" title="დამალვა">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M12 5c-7.633 0-11 7-11 7 1.042 2.141 3.88 5.5 8.5 6.6l-2.5 2.4 1.4 1.4 12-12-1.4-1.4-2.1 2.1C15.3 6 13.6 5 12 5z"/></svg>
              </button>
              <!-- Delete -->
              <button @click="deleteProduct(item.id)" class="text-gray-500 hover:text-red-600" title="წაშლა">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-current"><path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/></svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* no extra styles; Tailwind classes handle visuals */
</style>

