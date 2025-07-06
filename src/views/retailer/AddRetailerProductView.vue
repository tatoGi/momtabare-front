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
import { ICategory } from "@/ts/models/category.types.ts"
import { cities } from "@/constants/cities.ts"
import { addProduct } from "@/services/retailer.ts"
import { useCategoryStore } from "@/pinia/category.pinia.ts"
import { computed, ref } from "vue"

const categoryStore = useCategoryStore()

const { files, open, reset, onCancel, onChange } = useFileDialog()

const uploadedImage = ref("")
const productCategory = ref<string>("")
const productName = ref<string>("")
const selectedCurrency = ref<string>("usd")
const productPrice = ref<string>("")

onChange((selectedFiles) => {
  if (selectedFiles && selectedFiles.length > 0) {
    const file = selectedFiles[0]
    uploadedImage.value = URL.createObjectURL(file)
  }
})

const categories = computed<ICategory[]>(() => categoryStore.getCategories)

function selectCurrency(currency: string): void {
  selectedCurrency.value = currency
}

async function triggerAddRetailerProduct() {
  const newProduct = {
    name: productName.value,
  }

  addProduct(newProduct)
}
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
          <h2 class="font-bold dark:text-white">აირჩიე კატეგორია</h2>
          <p class="text-sm text-customBlack/70 dark:text-white/70">
            აირჩე კატეგორია რომელსაც მიეკუთვნება პროდუქცია
          </p>
        </div>
        <Select>
          <SelectTrigger class="w-[452px]">
            <SelectValue placeholder="აირჩიე კატეგორია" />
          </SelectTrigger>
          <SelectContent class="rounded-2xl">
            <SelectGroup>
              <SelectItem
                v-for="(category, index) in categories"
                :key="category + index"
                :class="{
                  'border-b border-b-customBlack/10':
                    index !== cities.length - 1,
                }"
                :value="category"
                class="py-3"
                >{{ category.name.ka }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
          <Select>
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
          <Input class="w-[452px]" placeholder="საკონტაქტო პირი" />
          <Input class="w-[452px]" placeholder="ტელეფონი" />
        </div>
      </div>

      <!--      <div-->
      <!--        class="flex items-center justify-between border-b border-customBlack/10 py-8"-->
      <!--      >-->
      <!--        <div class="flex flex-col items-start">-->
      <!--          <h2 class="font-bold dark:text-white">პროდუქციის მახასიათებლები</h2>-->
      <!--          <p class="text-sm text-customBlack/70 dark:text-white/70">-->
      <!--            მიუთითეთ პროდუქციის მახასიათებლები-->
      <!--          </p>-->
      <!--        </div>-->
      <!--        <Input-->
      <!--          class="h-[60px] w-[452px] border-dashed"-->
      <!--          placeholder="დაამატე მახასიათებელი"-->
      <!--        />-->
      <!--      </div>-->

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
          <input
            class="text-sm text-customBlack/70 placeholder-customBlack/70 dark:text-white/70"
            placeholder="ღირებულება"
          />

          <div class="flex items-center">
            <div
              :class="
                selectedCurrency === 'gel'
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
                selectedCurrency === 'usd'
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
        <Input class="w-[452px]" placeholder="დასახელება" />
      </div>

      <div class="flex items-center justify-between py-8">
        <p
          class="cursor-pointer text-sm font-medium text-customBlack/70 dark:text-white/70"
        >
          გასუფთავება
        </p>
        <BaseButton
          :height="48"
          class="font-uppercase bg-customRed px-5 text-sm font-bold text-white"
          >დაამატე პროდუქცია
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
