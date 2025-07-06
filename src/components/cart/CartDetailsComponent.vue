<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import { Input } from "@/components/ui/input"
import { ICart } from "@/ts/models/cart.types.ts"
import { checkout } from "../../services/order"
import { useRoute, useRouter } from "vue-router"

const router = useRouter()
const route = useRoute()

defineProps<{
  cart: ICart | null
}>()

async function orderButtonAction(): Promise<void> {
  if (route.path != "/checkout") {
    await router.push({ name: "checkout" })
    return
  }
  await checkout()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section
      class="border border-customBlack/10 rounded-2xl px-6 py-4 flex flex-col gap-4"
    >
      <h2 class="font-extrabold font-uppercase">შეკვეთის დეტალები</h2>

      <div class="flex items-center justify-between">
        <p class="text-customBlack/70 text-sm font-medium">
          პროდუქტ(ებ)ის რაოდენობა
        </p>
        <p class="text-sm font-bold">{{ cart?.items.length }}</p>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-customBlack/70 text-sm font-medium">ფასდაკლება</p>
        <p class="text-sm font-bold">-50 ₾</p>
      </div>
      <div class="flex items-center justify-between pb-1.5">
        <p class="text-customBlack/70 text-sm font-medium">
          პროდუქტ(ებ)ის ღირებულება
        </p>
        <p class="text-sm font-bold">{{ cart?.total_price.toFixed(2) }} ₾</p>
      </div>
      <div class="h-[1px] bg-customBlack/10"></div>
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold">ჯამური თანხა</p>
        <p class="text-customRed font-extrabold">
          {{ cart?.total_price.toFixed(2) }} ₾
        </p>
      </div>
    </section>

    <section
      class="border border-customBlack/10 rounded-2xl px-6 pt-4 pb-9 flex flex-col gap-3"
    >
      <h2 class="font-extrabold font-uppercase">პრომო კოდი</h2>
      <Input class="bg-customGrey" placeholder="შეიყვანე პრომო კოდი" />
    </section>

    <BaseButton
      :height="48"
      :width="356"
      class="bg-customRed"
      @click.left="orderButtonAction"
    >
      <p class="text-white text-sm font-bold font-uppercase">
        შეკვეთის გაფორმება
      </p>
    </BaseButton>
  </div>
</template>
