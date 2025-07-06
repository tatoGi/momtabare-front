<script lang="ts" setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { commentOnProduct } from "../../services/comments"
import { rateProduct } from "../../services/ratings"
import { IProduct } from "../../ts/models/product.types"
import BaseButton from "../base/BaseButton.vue"
import BaseIcon from "../base/BaseIcon.vue"
import { computed, ref } from "vue"
import { VisuallyHidden } from "radix-vue"

const props = defineProps<{
  product: IProduct | null
}>()
const dialogOpen = defineModel<boolean>()

const backendUrl = import.meta.env.VITE_BACKEND_URL

const hoveredRating = ref<number>(0)
const chosenRating = ref<number>(0)
const comment = ref<string>("")

const computedEffectiveRating = computed(() =>
  hoveredRating.value > 0 ? hoveredRating.value : chosenRating.value,
)
const computedImgUrl = computed<string>(() => {
  return `${backendUrl}/${props.product?.images[0].url}`
})

async function submitReview(): Promise<void> {
  if (!props.product) return
  const response = await rateProduct({
    rating: chosenRating.value,
    id: props.product.id,
  })
  if (!response) return
  commentOnProduct({ comment: comment.value, id: props.product.id })
  dialogOpen.value = false
}
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="w-[451px] p-8">
      <VisuallyHidden>
        <DialogDescription />
      </VisuallyHidden>

      <div class="flex flex-col gap-5">
        <DialogTitle>
          <h2
            class="text-xl font-uppercase font-extrabold text-customBlack mb-3 dark:text-white"
          >
            შეაფასე პროდუქტი
          </h2>
        </DialogTitle>

        <div
          class="flex items-center gap-3 border border-customBlack/10 dark:border-white/10 px-6 py-3 rounded-2xl"
        >
          <img :src="computedImgUrl" alt="Product Image" class="w-20 h-20" />
          <div class="flex flex-col items-start gap-2">
            <h2 class="text-sm font-medium dark:text-white truncate-two-lines">
              {{ product?.name }}
            </h2>
            <p
              class="text-xs text-customBlack/70 font-medium dark:text-white/70"
            >
              ზომა : {{ product?.size }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2">
          <BaseIcon
            v-for="index in 5"
            :key="index"
            :class="{
              'text-customRed dark:text-customRed':
                index <= computedEffectiveRating,
            }"
            :fill="index <= computedEffectiveRating"
            :size="50"
            class="transition-all text-customBlack/20 cursor-pointer dark:text-white/20"
            name="star"
            rounded
            @click="
              () => {
                if (chosenRating == index) {
                  chosenRating = 0
                  return
                }
                chosenRating = index
              }
            "
            @mouseenter="hoveredRating = index"
            @mouseleave="hoveredRating = 0"
          />
        </div>
        <textarea
          v-model="comment"
          class="resize-none outline-none border placeholder:text-customBlack/70 placeholder:text-white/70 border-customBlack/10 dark:border-white/10 dark:text-white px-6 py-3 rounded-xl h-32 text-sm dark:bg-customBlack"
          placeholder="დაწერე კომენტარი"
        ></textarea>
        <div
          class="w-full flex items-center border border-customBlack/10 dark:border-white/10 rounded-xl border-dashed justify-center gap-2 py-4"
        >
          <BaseIcon
            :size="24"
            class="dark:text-white"
            name="add_photo_alternate"
          />
          <h2 class="text-sm font-semibold dark:text-white">ატვირთე სურათი</h2>
        </div>
        <BaseButton
          :height="48"
          class="bg-customRed w-full rounded-full"
          @click.left="submitReview"
        >
          <p class="font-uppercase text-sm font-bold text-white">შეაფასე</p>
        </BaseButton>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
