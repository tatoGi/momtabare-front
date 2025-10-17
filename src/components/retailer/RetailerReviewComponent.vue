<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import BaseIcon from "../base/BaseIcon.vue";
import { ref, computed } from "vue";
import BaseButton from "../base/BaseButton.vue";
import { rateRetailer } from "../../services/ratings";
import { commentOnRetailer } from "../../services/comments";
import type { IUser } from "@/ts/models/user-types"
import { useRouter } from "vue-router";
import { getLocalizedApiUrl } from "@/utils/config/env";

const props = defineProps<{
  retailer: IUser | null;
}>();
const dialogOpen = defineModel<boolean>();

const router = useRouter()  

const hoveredRating = ref<number>(0); 
const chosenRating = ref<number>(0);  
const comment = ref<string>("")
const isLoading = ref<boolean>(false)
const errorMessage = ref<string>("")

const computedEffectiveRating = computed(() =>
  hoveredRating.value > 0 ? hoveredRating.value : chosenRating.value
);

const computedImgUrl = computed<string>(() => {
  if (!props.retailer?.profile_picture) return '';
  // Remove the extra slash between URL and path
  return `${getLocalizedApiUrl}${props.retailer.profile_picture.startsWith('/') ? '' : '/'}${props.retailer.profile_picture}`
})

async function submitReview(): Promise<void> {
  if (!props.retailer?.id) {
    errorMessage.value = "Retailer information is missing";
    return;
  }

  if (chosenRating.value === 0) {
    errorMessage.value = "გთხოვთ აირჩიოთ რეიტინგი";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    // 1. Submit the rating
    const ratingResponse = await rateRetailer({
      rating: chosenRating.value, 
      id: props.retailer.id
    });
    
    if (!ratingResponse) {
      throw new Error("Failed to submit rating");
    }

    // 2. If there's a comment, submit it
    if (comment.value.trim()) {
      try {
        await commentOnRetailer({
          comment: comment.value.trim(),
          rating: chosenRating.value,
          retailerId: props.retailer.id
        });
      } catch (commentError) {
        console.warn("Comment submission had an issue:", commentError);
        // Continue even if comment submission fails
      }
    }

    // 3. Close dialog and reset form
    dialogOpen.value = false;
    chosenRating.value = 0;
    hoveredRating.value = 0;
    comment.value = "";
    
  } catch (error) {
    console.error("Error submitting review:", error);
    errorMessage.value = "დაფიქსირდა შეცდომა. გთხოვთ სცადოთ თავიდან.";
  } finally {
    isLoading.value = false;
  }
}

function routeToRetailerPage(): void {
  if (!props.retailer?.id) return;
  router.push({
    name: 'retailer',
    params: { retailerId: props.retailer.id }
  });
}
</script>

<template>
  <Dialog v-model:open="dialogOpen" @update:open="(val) => !val && (dialogOpen = false)">
    <DialogContent class="w-[90%] md:w-1/2 lg:w-1/3 p-5 md:p-10">
      <div class="flex flex-col gap-5">
        <DialogTitle>
          <h1 class="font-uppercase font-bold text-customBlack text-2xl md:text-3xl text-center">
            შეაფასე გამქირავებელი
          </h1>
        </DialogTitle>

        <div v-if="errorMessage" class="text-red-500 text-sm text-center p-2 bg-red-50 rounded">
          {{ errorMessage }}
        </div>

        <div
          class="flex items-center gap-5 border border-customBlack/10 p-5 rounded-xl"
        >
          <BaseIcon
            v-if="!retailer?.profile_picture"
            :size="90"
            class="text-customBlack/70"
            name="account_circle"
          />
          <img 
            v-else
            :src="computedImgUrl" 
            alt="Retailer profile"
            class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
          />
          <div>
            <h1 class="font-uppercase text-lg md:text-xl">{{ retailer?.first_name }} {{ retailer?.last_name }}</h1>
            <h2
              class="text-xs font-medium text-customBlue underline cursor-pointer transition-all hover:text-customRed inline-block"
              @click="routeToRetailerPage"
            >
              პროდუქცია
            </h2>
          </div>
        </div>

        <div class="flex items-center justify-center gap-2 md:gap-5">
          <button
            v-for="index in 5"
            :key="index"
            @click="chosenRating = chosenRating === index ? 0 : index"
            @mouseover="hoveredRating = index"
            @mouseleave="hoveredRating = 0"
            class="text-3xl md:text-4xl focus:outline-none transition-transform hover:scale-110"
            :class="{
              'text-yellow-400': index <= computedEffectiveRating,
              'text-gray-300': index > computedEffectiveRating
            }"
            :disabled="isLoading"
          >
            ★
          </button>
        </div>

        <div class="mt-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ chosenRating === 0 ? 'აირჩიეთ რეიტინგი' : `თქვენი რეიტინგი: ${chosenRating}` }}
          </label>
        </div>

        <div>
          <label for="comment" class="block text-sm font-medium text-gray-700 mb-1">
            კომენტარი (არასავალდებულო):
          </label>
          <textarea
            id="comment"
            v-model="comment"
            placeholder="დაწერეთ თქვენი შეფასება..."
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-customBlue focus:border-customBlue transition duration-200"
            :disabled="isLoading"
            rows="4"
          ></textarea>
        </div>

        <div class="w-full flex items-center justify-center gap-5 opacity-50 cursor-not-allowed" title="Coming soon">
          <BaseIcon name="upload" :size="24" class="text-customBlack"/>
          <span class="font-uppercase font-semibold text-sm md:text-base">ატვირთე სურათი (მალე)</span>
        </div>

        <BaseButton
          :height="50"
          class="bg-customRed w-full rounded-full mt-2 hover:bg-red-700 transition-colors"
          @click="submitReview"
          :disabled="isLoading || chosenRating === 0"
          :loading="isLoading"
        >
          <span class="font-uppercase text-lg font-bold text-white">
            {{ isLoading ? 'მიმდინარეობს...' : 'შეფასების გაგზავნა' }}
          </span>
        </BaseButton>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Add any custom styles here if needed */
</style>