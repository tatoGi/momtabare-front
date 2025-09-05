<script lang="ts" setup>
import { useUserStore } from "@/pinia/user.pinia"
import { computed, ref } from "vue"
import type { IUser } from "@/ts/models/user-types"

const userStore = useUserStore()

const user = computed<IUser>(() => userStore.getUser as IUser)

// Edit mode states
const editingField = ref<string | null>(null)
const editValues = ref<Record<string, string>>({})

// Password change specific states
const passwordForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

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
</script>

<template>
  <main class="pb-20 pt-8">
    <h2 class="font-uppercase text-xl font-extrabold dark:text-white">პირადი ინფორმაცია</h2>
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
