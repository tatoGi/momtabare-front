<script lang="ts" setup>
import ratingDisplay from "@/assets/svg/rating-display.svg"
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
import { IComment } from "@/ts/models/comment.types.ts"
import type { IUser } from "@/ts/models/user-types"
import { computed } from "vue";
import BaseIcon from "../../../components/base/BaseIcon.vue";

const props = defineProps<{
  comments: IComment[]
  retailer: IUser
}>()
const computedRatingStats = computed(() => {
  const { average, total, ...ratings } = props.retailer.rating_stats;
  const totalRatings = Object.values(ratings).reduce((sum, value) => sum + value, 0);

  return Object.entries(ratings).map(([key, value]) => ({
    ratingNumber: key.replace(/\D/g, ''), // Extract the numeric part
    value,
    proportion: totalRatings > 0 ? value / totalRatings : 0, // Calculate the proportion
  }));
});
function generateUserFullName(user: IUser): string {
  return `${user?.first_name} ${user?.last_name}` || "N/A"
}

</script>

<template>
  <div class="">
    <h1 class="font-uppercase text-lg font-extrabold text-customBlack">
      მომხმარებლების შეფასება
    </h1>

    <div class="flex gap-6 pt-5">
      <div class="h-fit w-80 rounded-lg border border-customBlack/10">
        <div class="relative flex justify-center py-8">
          <img :src="ratingDisplay" alt="" />
          <h3
            class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-customRed"
          >
            {{ props.retailer.rating_stats.average }}
          </h3>
         
        </div>
        <div class="w-full flex items-center flex-col justify-center py-5">
          <div class="flex items-center gap-3" v-for="rating in computedRatingStats" :key="rating.ratingNumber">
            <BaseIcon :size="24" :fill="true" class="text-customRed" :rounded="true" name="star"/>
            <h1 class="text-customRed font-semibold">{{ rating.ratingNumber }}</h1>
            <div class="relative bg-customGrey h-2 w-40 rounded-full overflow-hidden">
              <div
                class="absolute left-0 top-0 h-full bg-customRed rounded-full"
                :style="{ width: `${rating.proportion * 100}%` }"
              ></div>
            </div>
            <h1 class="text-customBlack/50 font-semibold">{{ rating.value }}</h1>
          </div>
        </div>
       
      </div>
      <div
        v-if="props?.comments?.length > 0"
        class="flex flex-grow flex-col gap-4"
      >
        <div
          v-for="comment in props.comments"
          class="flex w-full flex-col items-start gap-3 rounded-lg border border-customBlack/10 p-5"
        >
          <RatingStatusComponent :rating="comment.rating_by_user" />
          <h1 class="text-sm">
            {{ generateUserFullName(comment.user) }}
            <span class="text-customBlack/50">
              / 21 თებ, 2024 - 23 თებ, 2024
            </span>
          </h1>
          <h1 class="text-sm">
            {{ comment.comment }}
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
