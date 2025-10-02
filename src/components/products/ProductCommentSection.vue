<script lang="ts" setup>
import { createProductComment, getUserProductComment } from "@/services/comments.ts"
import { useUserStore } from "@/pinia/user.pinia.ts"
import { ref, onMounted, computed } from 'vue'
import type { IProduct } from "@/ts/models/product.types.ts"

const props = defineProps<{
  comments: any[] | null
  product: IProduct | null
}>()

const emit = defineEmits<{
  refreshComments: []
}>()
const userStore = useUserStore()

// Comment form state
const commentText = ref('')
const selectedRating = ref<number | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

// User's existing comment
const userComment = ref<any>(null)
const hasExistingComment = ref(false)

// Check if user already has a comment for this product
async function checkUserComment() {
  if (!userStore.user || !props.product?.id) return
  
  try {
    const response = await getUserProductComment(props.product.id)
    if (response?.data) {
      userComment.value = response.data
      hasExistingComment.value = true
    }
  } catch (error) {
    console.error('Error checking user comment:', error)
  }
}

// Submit new comment
async function submitComment() {
  if (!userStore.user) {
    userStore.setAuthDialog(true)
    return
  }

  if (!props.product?.id || !commentText.value.trim()) {
    submitError.value = 'კომენტარი სავალდებულოა'
    return
  }

  if (commentText.value.length < 10) {
    submitError.value = 'კომენტარი უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს'
    return
  }

  try {
    isSubmitting.value = true
    submitError.value = ''
    submitSuccess.value = ''

    const response = await createProductComment(props.product.id, {
      comment: commentText.value.trim(),
      rating: selectedRating.value || undefined
    })

    if (response) {
      submitSuccess.value = 'კომენტარი წარმატებით გაიგზავნა. ის გამოჩნდება ადმინისტრაციის დამტკიცების შემდეგ.'
      commentText.value = ''
      selectedRating.value = null
      hasExistingComment.value = true
      
      // Refresh comments list
      emit('refreshComments')
      
      // Check for updated user comment
      setTimeout(() => {
        checkUserComment()
      }, 1000)
    } else {
      submitError.value = 'კომენტარის გაგზავნისას მოხდა შეცდომა'
    }
  } catch (error: any) {
    console.error('Error submitting comment:', error)
    if (error.response?.data?.error) {
      submitError.value = error.response.data.error
    } else {
      submitError.value = 'კომენტარის გაგზავნისას მოხდა შეცდომა'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Rating selection
function selectRating(rating: number) {
  selectedRating.value = rating === selectedRating.value ? null : rating
}

const canWriteComment = computed(() => {
  return userStore.user && !hasExistingComment.value
})

// Helper function to get user initials (like m** j**)
function getUserInitials(fullName: string): string {
  if (!fullName) return '***'
  
  const names = fullName.trim().split(' ')
  if (names.length === 1) {
    // Single name: show first letter + **
    return names[0].charAt(0).toLowerCase() + '**'
  } else {
    // Multiple names: show first letter of each + **
    return names.map(name => name.charAt(0).toLowerCase() + '**').join(' ')
  }
}

// Helper function to format date in Georgian style
function formatCommentDate(dateString: string): string {
  const date = new Date(dateString)
  
  // Georgian month names
  const georgianMonths = [
    'იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ',
    'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'
  ]
  
  const day = date.getDate()
  const month = georgianMonths[date.getMonth()]
  const year = date.getFullYear()
  
  // Format like: "21 თებ, 2024 - 23 თებ, 2024" (for now just single date)
  return `${day} ${month}, ${year}`
}

onMounted(() => {
  checkUserComment()
})
</script>

<template>
  <div class="flex w-full flex-col items-start gap-5">
    <!-- Comment Writing Form -->
    <div v-if="canWriteComment" class="w-full">
      <h2 class="text-lg font-bold text-customBlack mb-4">კომენტარის დაწერა</h2>
      
      <!-- Rating Selection -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-customBlack mb-2">შეფასება (არასავალდებულო)</label>
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="selectRating(star)"
            class="text-2xl transition-colors duration-200"
            :class="selectedRating && star <= selectedRating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Comment Text Area -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-customBlack mb-2">კომენტარი *</label>
        <textarea
          v-model="commentText"
          placeholder="დაწერეთ თქვენი კომენტარი..."
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44000] focus:border-transparent resize-none"
          rows="4"
          :disabled="isSubmitting"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">მინიმუმ 10 სიმბოლო</p>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="submitError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ submitError }}
      </div>
      <div v-if="submitSuccess" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        {{ submitSuccess }}
      </div>

      <!-- Submit Button -->
      <button
        @click="submitComment"
        :disabled="isSubmitting || !commentText.trim()"
        class="bg-[#F44000] text-white px-6 py-2 rounded-lg hover:bg-[#d63600] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <span v-if="isSubmitting">იგზავნება...</span>
        <span v-else>კომენტარის გაგზავნა</span>
      </button>
    </div>


    <!-- Login Prompt -->
    <div v-else-if="!userStore.user" class="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <p class="text-gray-700">კომენტარის დასაწერად საჭიროა ავტორიზაცია.</p>
      <button
        @click="userStore.setAuthDialog(true)"
        class="mt-2 bg-[#F44000] text-white px-4 py-2 rounded hover:bg-[#d63600] transition-colors duration-200"
      >
        შესვლა
      </button>
    </div>

    <!-- Comments List -->
    <div
      v-if="props?.comments?.length"
      class="flex w-full flex-col items-start gap-3"
    >
      <h1 class="font-uppercase text-lg font-extrabold text-customBlack">
        მომხმარებლების შეფასება
      </h1>
      <div
        v-for="comment in props.comments"
        :key="comment.id"
        class="flex w-full flex-col items-start gap-3 rounded-lg bg-gray-50 p-5 border-l-4 border-orange-500"
      >
        <!-- Star Rating -->
        <div class="flex items-center gap-1">
          <span v-for="star in 5" :key="star" class="text-lg">
            {{ comment.rating && star <= comment.rating ? '★' : '☆' }}
          </span>
          <span class="text-sm text-gray-500 ml-2">({{ comment.rating || 0 }})</span>
        </div>
        
        <!-- User and Date -->
        <div class="text-sm text-gray-700">
          {{ getUserInitials(comment.user.name) }}
          <span class="text-gray-500 ml-2">{{ formatCommentDate(comment.created_at) }}</span>
        </div>
        
        <!-- Comment Text -->
        <p class="text-sm text-gray-800 leading-relaxed">
          {{ comment.comment }}
        </p>
      </div>
    </div>
  </div>
</template>

