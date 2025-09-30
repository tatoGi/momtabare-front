<script lang="ts" setup>
import { useUserStore } from "@/pinia/user.pinia"
import { computed, ref } from "vue"
import type { IUser } from "@/ts/models/user-types"
import { uploadUserAvatar } from "@/services/user"
import { getAssetUrl } from "@/utils/config/env"

const userStore = useUserStore()

const user = computed<IUser | null>(() => userStore.user)

// Edit mode states
const editingField = ref<string | null>(null)
const editValues = ref<Record<string, string>>({})

// Password change specific states
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Avatar upload states
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const isUploadingAvatar = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

// Functions to handle editing
function startEditing(fieldKey: string, currentValue: string | null) {
  editingField.value = fieldKey
  editValues.value[fieldKey] = currentValue || ''
}

function cancelEditing() {
  editingField.value = null
  editValues.value = {}
  // Reset password form when canceling password edit
  if (editingField.value === 'password') {
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  }
}

async function saveField(fieldKey: string) {
  try {
    if (fieldKey === 'password') {
      await savePassword()
      return
    }
    
    const newValue = editValues.value[fieldKey]
    
    // Map field keys to user object properties
    const fieldMapping: Record<string, string> = {
      'first_name': 'first_name',
      'last_name': 'last_name',
      'personal_id': 'personal_id',
      'birth_date': 'birth_date',
      'gender': 'gender',
      'phone': 'phone',
      'email': 'email'
    }
    
    const updatePayload: Partial<IUser> = {
      [fieldMapping[fieldKey]]: newValue
    }
    
    await userStore.updateProfile(updatePayload)
    
    editingField.value = null
    editValues.value = {}
    
    console.log(`Updated ${fieldKey}:`, newValue)
  } catch (error) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile. Please try again.')
  }
}

async function savePassword() {
  try {
    // Validate password form
    if (!passwordForm.value.current_password) {
      alert('გთხოვთ შეიყვანოთ მიმდინარე პაროლი')
      return
    }
    
    if (!passwordForm.value.new_password) {
      alert('გთხოვთ შეიყვანოთ ახალი პაროლი')
      return
    }
    
    if (passwordForm.value.new_password.length < 8) {
      alert('ახალი პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო')
      return
    }
    
    if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
      alert('ახალი პაროლი და დადასტურება არ ემთხვევა')
      return
    }
    
    // Call password update API
    const updatePayload = {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.new_password,
      password_confirmation: passwordForm.value.confirm_password
    }
    
    await userStore.updateProfile(updatePayload as any)
    
    // Reset form and exit edit mode
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
    editingField.value = null
    
    alert('პაროლი წარმატებით შეიცვალა')
    
  } catch (error) {
    console.error('Failed to update password:', error)
    alert('პაროლის შეცვლა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.')
  }
}

const personalInfoFields = computed(() => [
  {
    key: "first_name",
    title: "სახელი",
    value: user.value?.first_name || null,
    editable: true
  },
  {
    key: "last_name", 
    title: "გვარი",
    value: user.value?.last_name || user.value?.surname || null,
    editable: true
  },
  {
    key: "personal_id",
    title: "პირადი ნომერი",
    value: user.value?.personal_id || null,
    editable: true
  },
  {
    key: "birth_date",
    title: "დაბადების თარიღი",
    value: user.value?.birth_date || null,
    editable: true
  },
  {
    key: "gender",
    title: "სქესი",
    value: user.value?.gender || null,
    editable: true
  },
  {
    key: "password",
    title: "პაროლი",
    value: "******",
    editable: true
  }
])
const contactInfoFields = computed(() => [
  {
    key: "phone",
    title: "ტელეფონის ნომერი",
    value: user.value?.phone || user.value?.phone_number ? formatPhoneNumber(user.value.phone || user.value.phone_number || '') : null,
    editable: true
  },
  {
    key: "email",
    title: "ელ.ფოსტა",
    value: user.value?.email || null,
    editable: true
  }
])

function formatPhoneNumber(phone: string): string {
  const regex = /^(\+\d{3})(\d{3})(\d{3})(\d{3})$/
  return <string>phone?.replace(regex, "$1 $2 $3 $4")
}

// Avatar upload functions
function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function handleAvatarSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('გთხოვთ აირჩიოთ სურათის ფაილი')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ფაილის ზომა არ უნდა აღემატებოდეს 5MB-ს')
      return
    }
    
    avatarFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function uploadAvatar() {
  if (!avatarFile.value) return
  
  try {
    isUploadingAvatar.value = true
    
    const updatedUser = await uploadUserAvatar(avatarFile.value)
    
    if (updatedUser) {
      // Update user store with new profile picture
      await userStore.initializeAuth()
      
      // Clear preview and file
      avatarFile.value = null
      avatarPreview.value = null
      
      alert('ავატარი წარმატებით აიტვირთა')
    }
  } catch (error) {
    console.error('Avatar upload failed:', error)
    alert('ავატარის ატვირთვა ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.')
  } finally {
    isUploadingAvatar.value = false
  }
}

function cancelAvatarUpload() {
  avatarFile.value = null
  avatarPreview.value = null
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

// Get user avatar URL or fallback to first letter
const userAvatarUrl = computed(() => {
  // Check both avatar and profile_picture fields for compatibility
  const avatarPath = user.value?.avatar || user.value?.profile_picture
  if (avatarPath) {
    return getAssetUrl(`/storage/${avatarPath}`)
  }
  return null
})

const userInitials = computed(() => {
  const firstName = user.value?.first_name || ''
  const lastName = user.value?.last_name || user.value?.surname || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U'
})
</script>

<template>
  <main class="pb-20 pt-8">
    <h2 class="font-uppercase text-xl font-extrabold dark:text-white">პირადი ინფორმაცია</h2>
    
    <!-- Avatar Section -->
    <div class="flex justify-center pt-6 pb-4">
      <div class="flex flex-col items-center gap-4">
        <!-- Avatar Display -->
        <div class="relative">
          <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
            <img 
              v-if="avatarPreview || userAvatarUrl" 
              :src="avatarPreview || userAvatarUrl" 
              :alt="user?.first_name || 'User'"
              class="w-full h-full object-cover"
            />
            <div 
              v-else 
              class="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300"
            >
              {{ userInitials }}
            </div>
          </div>
          
          <!-- Upload Button -->
          <button
            @click="triggerAvatarUpload"
            class="absolute -bottom-1 -right-1 w-8 h-8 bg-[#F44000] text-white rounded-full flex items-center justify-center hover:bg-[#d63700] transition-colors"
            :disabled="isUploadingAvatar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
        
        <!-- Upload Controls -->
        <div v-if="avatarFile" class="flex gap-2">
          <button
            @click="uploadAvatar"
            :disabled="isUploadingAvatar"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {{ isUploadingAvatar ? 'იტვირთება...' : 'ატვირთვა' }}
          </button>
          <button
            @click="cancelAvatarUpload"
            :disabled="isUploadingAvatar"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
          >
            გაუქმება
          </button>
        </div>
        
        <!-- Hidden File Input -->
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          @change="handleAvatarSelect"
          class="hidden"
        />
      </div>
    </div>
    
    <div class="flex gap-6 pt-7">
      <div class="w-1/2 rounded-2xl border border-customBlack/10 dark:border-white/10 px-6 pt-4">
        <p class="font-uppercase font-extrabold dark:text-white">პერსონალური</p>
        <div
          v-for="(personalInfoField, index) in personalInfoFields"
          :key="personalInfoField.key"
          :class="{
            'border-b border-b-customBlack/10 dark:border-white/10':
              index !== personalInfoFields.length - 1,
          }"
          class="flex h-20 items-center justify-between pb-1"
        >
          <div class="flex flex-col flex-1">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              {{ personalInfoField.title }}
            </p>
            
            <!-- Password change form -->
            <div v-if="editingField === personalInfoField.key && personalInfoField.key === 'password'" class="flex flex-col gap-3 mt-1">
              <div class="flex flex-col gap-2">
                <input
                  v-model="passwordForm.current_password"
                  type="password"
                  placeholder="მიმდინარე პაროლი"
                  class="text-sm font-semibold dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                />
                <input
                  v-model="passwordForm.new_password"
                  type="password"
                  placeholder="ახალი პაროლი (მინ. 8 სიმბოლო)"
                  class="text-sm font-semibold dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                />
                <input
                  v-model="passwordForm.confirm_password"
                  type="password"
                  placeholder="დაადასტურეთ ახალი პაროლი"
                  class="text-sm font-semibold dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="saveField(personalInfoField.key)"
                  class="text-green-600 hover:text-green-700 text-xs px-3 py-2 border border-green-600 rounded"
                >
                  პაროლის შეცვლა
                </button>
                <button
                  @click="cancelEditing"
                  class="text-red-600 hover:text-red-700 text-xs px-3 py-2 border border-red-600 rounded"
                >
                  გაუქმება
                </button>
              </div>
            </div>
            
            <!-- Regular edit mode input -->
            <div v-else-if="editingField === personalInfoField.key" class="flex items-center gap-2 mt-1">
              <input
                v-model="editValues[personalInfoField.key]"
                :type="personalInfoField.key === 'birth_date' ? 'date' : 'text'"
                class="text-sm font-semibold dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1"
                @keyup.enter="saveField(personalInfoField.key)"
                @keyup.escape="cancelEditing"
              />
              <button
                @click="saveField(personalInfoField.key)"
                class="text-green-600 hover:text-green-700 text-xs px-2 py-1 border border-green-600 rounded"
              >
                შენახვა
              </button>
              <button
                @click="cancelEditing"
                class="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-600 rounded"
              >
                გაუქმება
              </button>
            </div>
            
            <!-- Display mode -->
            <p v-else class="text-sm font-semibold dark:text-white">
              {{ personalInfoField.value || 'არ არის მითითებული' }}
            </p>
          </div>
          
          <!-- Edit/Add button -->
          <p
            v-if="personalInfoField.editable && editingField !== personalInfoField.key"
            @click="startEditing(personalInfoField.key, personalInfoField.value)"
            :class="{ 'text-customBlue dark:text-customBlue': !personalInfoField.value }"
            class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70 underline ml-4"
          >
            {{ personalInfoField.value ? "რედაქტირება" : "დაამატე" }}
          </p>
        </div>
      </div>
      <div
        class="h-fit w-1/2 rounded-2xl border border-customBlack/10 dark:border-white/10 px-6 pt-4"
      >
        <p class="font-uppercase font-extrabold">საკონტაქტო</p>
        <div
          v-for="(contactInfoField, index) in contactInfoFields"
          :key="contactInfoField.key"
          :class="{
            'border-b border-b-customBlack/10 dark:border-white/10':
              index !== contactInfoFields.length - 1,
          }"
          class="flex h-20 items-center justify-between pb-1"
        >
          <div class="flex flex-col flex-1">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              {{ contactInfoField.title }}
            </p>
            
            <!-- Edit mode input -->
            <div v-if="editingField === contactInfoField.key" class="flex items-center gap-2 mt-1">
              <input
                v-model="editValues[contactInfoField.key]"
                :type="contactInfoField.key === 'email' ? 'email' : 'tel'"
                class="text-sm font-semibold dark:text-white bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 flex-1"
                @keyup.enter="saveField(contactInfoField.key)"
                @keyup.escape="cancelEditing"
              />
              <button
                @click="saveField(contactInfoField.key)"
                class="text-green-600 hover:text-green-700 text-xs px-2 py-1 border border-green-600 rounded"
              >
                შენახვა
              </button>
              <button
                @click="cancelEditing"
                class="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-600 rounded"
              >
                გაუქმება
              </button>
            </div>
            
            <!-- Display mode -->
            <p v-else class="text-sm font-semibold dark:text-white">
              {{ contactInfoField.value || 'არ არის მითითებული' }}
            </p>
          </div>
          
          <!-- Edit/Add button -->
          <p
            v-if="contactInfoField.editable && editingField !== contactInfoField.key"
            @click="startEditing(contactInfoField.key, contactInfoField.value)"
            :class="{ 'text-customBlue dark:text-customBlue': !contactInfoField.value }"
            class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70 underline ml-4"
          >
            {{ contactInfoField.value ? "რედაქტირება" : "დაამატე" }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
