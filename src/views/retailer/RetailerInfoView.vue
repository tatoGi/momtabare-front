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
import { IUser } from "@/ts/models/user.types.ts"
import { cities } from "@/constants/cities.ts"
import { useUserStore } from "@/pinia/user.pinia.ts"
import { computed, ref, watch } from "vue"

const userStore = useUserStore()

const avatarImage = ref<string | null>(null)
const coverImage = ref<string | null>(null)

const retailerName = ref<string>("")
const retailerLocation = ref<string>("")
const userFullName = ref<string>("")
const userPhone = ref<string>("")

const user = computed<IUser>(() => userStore.getUser)

function handleImageUpload(files: FileList, type: string): void {
  const file = files[0]
  if (file) {
    const imageUrl = URL.createObjectURL(file)
    if (type === "avatar") {
      avatarImage.value = imageUrl
    } else if (type === "cover") {
      coverImage.value = imageUrl
    }
  }
}

watch(user, (value) => {
  if (!value) return

  if (userFullName.value === "") {
    console.log(user.value, "kora")
    userFullName.value = user.value.first_name + " " + user.value.last_name
  }
})
</script>

<template>
  <BaseBreadcrumbs :path="['ჩემი პროფილი']" disable-route />
  <main class="flex justify-between gap-28 pb-24 pt-3">
    <section class="w-full">
      <h2 class="font-uppercase text-xl font-extrabold dark:text-white">
        ჩემი მაღაზია
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
          <h2 class="font-bold dark:text-white">მაღაზიის დასახელება</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            ამ დასახელებას დაინახავს მომხმარებელი, როდესაც თქვენ მაღაზიაში
            გადმოვა.
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

      <BaseButton
        :height="48"
        class="font-uppercase ml-auto bg-customRed px-5 text-sm font-bold text-white"
        >შეინახე
      </BaseButton>
    </section>
    <section
      class="relative h-[230px] w-[450px] overflow-hidden rounded-2xl border border-customBlack/10"
    >
      <div class="relative h-[53%] w-full">
        <img
          v-if="coverImage"
          :src="coverImage"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div v-else class="absolute inset-0 h-full w-full bg-gray-200"></div>
      </div>

      <div class="absolute left-5 top-[88px] h-16 w-16 rounded-full">
        <img
          v-if="avatarImage"
          :src="avatarImage"
          class="h-full w-full rounded-full object-cover"
        />
        <div v-else class="h-full w-full rounded-full bg-gray-300"></div>
      </div>

      <div
        class="flex h-[57%] h-full flex-col items-start justify-center gap-1.5 pl-6"
      >
        <p
          class="absolute left-24 top-32 text-xs font-medium text-customBlack/70"
        >
          10 პროდუქცია
        </p>
        <h2 class="text-sm font-semibold">{{ retailerName }}</h2>
        <div class="flex items-start gap-2">
          <BaseIcon
            v-show="retailerLocation"
            :size="16"
            class="text-customRed"
            name="location_on"
          />
          <p class="text-xs font-semibold text-customRed">
            {{ retailerLocation }}
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
