<script lang="ts" setup>
import mastercard from "@/assets/svg/mastercard.svg"
import visa from "@/assets/svg/visa.svg"
import CartDetailsComponent from "@/components/cart/CartDetailsComponent.vue"
import CheckoutProductItem from "@/components/cart/CheckoutProductItem.vue"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ICart } from "@/ts/models/cart.types.ts"
import { IUser } from "@/ts/models/user.types.ts"
import { useCartStore } from "@/pinia/cart.pinia.ts"
import { useUserStore } from "@/pinia/user.pinia.ts"
import { computed, ref, watch } from "vue"

const cartStore = useCartStore()
const userStore = useUserStore()

const fullName = ref<string>()
const phoneNumber = ref<string>()

const cart = computed<ICart | null>(() => {
  return cartStore.getCart
})

const user = computed<IUser | null>(() => {
  return userStore.getUser
})

watch(
  user,
  (value) => {
    if (!value) return

    fullName.value = user.value?.first_name + " " + user.value?.last_name
    phoneNumber.value = user.value?.email
  },
  { immediate: true },
)
</script>

<template>
  <main>
    <div class="flex gap-7 pt-9 pb-28">
      <div class="w-full flex flex-col gap-5">
        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">საკონტაქტო ინფორმაცია</h2>
            <p class="text-sm text-customBlack/70">
              მიუთითეთ სად შეძლებს მქირავებელი პროდუქციის აღებას და ასევე ვის
              დაუკავშირდება
            </p>
          </div>

          <div class="flex flex-col gap-5 w-full">
            <Input v-model="fullName" />
            <Input v-model="phoneNumber" />
          </div>
        </div>

        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">გადახდის მეთოდი</h2>
            <p class="text-sm text-customBlack/70">
              გთხოვ აირჩიოთ გადახდის მეთოდი
            </p>
          </div>

          <div class="flex flex-col gap-4 w-full">
            <div
              class="border border-customBlack/10 flex justify-between items-center rounded-xl px-5 py-2.5"
            >
              <img :src="visa" alt="visa" />
              <p class="text-customBlue text-sm font-bold">**** 6744</p>
            </div>

            <div
              class="border border-customBlack/10 flex justify-between items-center rounded-xl px-5 py-2.5"
            >
              <img :src="mastercard" alt="mastercard" />
              <p class="text-customRed text-sm font-bold">**** 4000</p>
            </div>

            <div
              class="border border-customBlack/10 flex justify-center items-center rounded-xl py-4"
            >
              <p class="text-sm font-semibold">სხვა ბარათით გადახდა</p>
            </div>

            <div class="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label class="text-sm font-medium" for="terms">
                დაიმახსოვრე ბარათი
              </Label>
            </div>
          </div>
        </div>

        <div
          class="border border-customBlack/10 rounded-2xl flex px-8 py-6 gap-6"
        >
          <div class="flex flex-col gap-2 min-w-[430px]">
            <h2 class="font-bold">პროდუქტები</h2>
            <p class="text-sm text-customBlack/70">
              თქვენ მიერ არჩეული პროდუქცია
            </p>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <CheckoutProductItem
              v-for="cartItem in cart?.items"
              :key="cartItem.id"
              :product="cartItem.product"
            />
          </div>
        </div>
      </div>

      <CartDetailsComponent :cart="cart" />
    </div>
  </main>
</template>
