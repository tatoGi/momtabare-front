<script lang="ts" setup>
import { useUserStore } from "@/pinia/user.pinia.ts"
import { computed } from "vue"
import { IUser } from "@/ts/models/user.types.js"

const userStore = useUserStore()

const user = computed<IUser>(() => userStore.getUser as IUser)

const personalInfoFields = computed(() => [
  {
    title: "მომხმარებელი",
    value: user.value?.first_name + " " + user.value?.last_name
  },
  {
    title: "პირადი ნომერი",
    value: null
  },
  {
    title: "დაბადების თარიღი",
    value: null
  },
  {
    title: "სქესი",
    value: "მამრობითი"
  },
  {
    title: "პაროლი",
    value: "******"
  }
])

const contactInfoFields = [
  {
    title: "ტელეფონის ნომერი",
    value: formatPhoneNumber("+995577414828")
  },
  {
    title: "ელ.ფოსტა",
    value: null
  }
]

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
          :class="{
            'border-b border-b-customBlack/10 dark:border-white/10':
              index !== personalInfoFields.length - 1,
          }"
          class="flex h-20 items-center justify-between pb-1"
        >
          <div class="flex flex-col">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              {{ personalInfoField.title }}
            </p>
            <p class="text-sm font-semibold dark:text-white">{{ personalInfoField.value }}</p>
          </div>
          <p
            :class="{ 'text-customBlue dark:text-customBlue': !personalInfoField.value }"
            class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70 underline"
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
          :class="{
            'border-b border-b-customBlack/10 dark:border-white/10':
              index !== contactInfoFields.length - 1,
          }"
          class="flex h-20 items-center justify-between pb-1"
        >
          <div class="flex flex-col">
            <p class="text-sm font-medium text-customBlack/70 dark:text-white/70">
              {{ contactInfoField.title }}
            </p>
            <p class="text-sm font-semibold dark:text-white">{{ contactInfoField.value }}</p>
          </div>
          <p
            :class="{ 'text-customBlue dark:text-customBlue': !contactInfoField.value }"
            class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70 underline"
          >
            {{ contactInfoField.value ? "რედაქტირება" : "დაამატე" }}
          </p>
        </div>
      </div>
    </div>
  </main>
</template>
