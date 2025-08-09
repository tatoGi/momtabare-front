<script lang="ts" setup>
import RatingStatusComponent from "@/components/products/product-stats/RatingStatusComponent.vue"
// import { IComment } from "@/ts/models/comment.types.ts" // Temporarily disabled to fix import issues

const props = defineProps<{
  comments: any[] | null
}>()
</script>
<template>
  <div
    v-if="props?.comments?.length"
    class="flex w-full flex-col items-start gap-3"
  >
    <h1 class="font-uppercase text-lg font-extrabold text-customBlack">
      მომხმარებლების შეფასება
    </h1>
    <div
      v-for="comment in props.comments"
      class="flex w-full flex-col items-start gap-3 rounded-lg border border-customBlack/10 p-5"
    >
      <RatingStatusComponent :rating="comment.rating_by_user" />
      <h1 class="text-sm">
        {{ comment.user.first_name }}
        <span class="text-customBlack/50">/ 21 თებ, 2024 - 23 თებ, 2024</span>
      </h1>
      <h1 class="text-sm">
        {{ comment.comment }}
      </h1>
    </div>
  </div>
</template>

<style scoped></style>
