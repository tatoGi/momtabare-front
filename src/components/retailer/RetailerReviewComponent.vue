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

const props = defineProps<{
  retailer: IUser | null;
}>();
const dialogOpen = defineModel<boolean>();

const router = useRouter()
const backendUrl = import.meta.env.VITE_BACKEND_URL;


const hoveredRating = ref<number>(0); 
const chosenRating = ref<number>(0);  
const comment = ref<string>("")

const computedEffectiveRating = computed(() =>
  hoveredRating.value > 0 ? hoveredRating.value : chosenRating.value
);

const computedImgUrl = computed<string>(()=>{
    return `${backendUrl}/${props.retailer?.profile_picture}`
})

async function submitReview():Promise<void>{
    if(!props.retailer) return
    const response = await rateRetailer({rating : chosenRating.value, id : props.retailer.id});
    if(!response) return
    commentOnRetailer({comment : comment.value, id : props.retailer.id});
    dialogOpen.value = false
}
function routeToRetailerPage(): void {
  if(!props.retailer) return
  router.replace({ path: `/retailer/${props.retailer.id}` })
}

</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="w-1/4 p-10">
      <div class="flex flex-col gap-5">
        <DialogTitle>
          <h1 class="font-uppercase font-bold text-customBlack text-3xl">
            შეაფასე გამქირავებელი
          </h1>
        </DialogTitle>

        <div
          class="flex items-center gap-5 border border-customBlack/10 p-5 rounded-xl"
        >
          <BaseIcon
            :size="90"
            class="text-customBlack/70"
            name="account_circle"
          />
          <div>
            <h1 class="font-uppercase text-xl">{{ retailer?.first_name }}</h1>
            <h2
            class="text-xs font-medium text-customBlue underline cursor-pointer transition-all hover:text-customRed"
            @click="routeToRetailerPage"
          >
            პროდუქცია
          </h2>
          </div>
        </div>

        <div class="flex items-center justify-center gap-5">
          <BaseIcon
            v-for="index in 5"
            :key="index"
            :fill="index <= computedEffectiveRating"
            :size="50"
            class="transition-all text-customRed cursor-pointer"
            name="star"
            rounded
            @mouseenter="hoveredRating = index"
            @mouseleave="hoveredRating = 0" 
            @click="()=>{
                if(chosenRating == index){
                    chosenRating = 0;
                    return
                }
                chosenRating = index
            }" 
          />
        </div>
        <textarea
          v-model="comment"
          placeholder="დაწერე კომენტარი"
          class="resize-none outline-none border border-customBlack/20 p-5 rounded-lg h-36 text-lg"
        ></textarea>
        <div class="w-full flex items-center justify-center gap-5">
            <BaseIcon name="upload" :size="50" class="color-customBlack"/>
            <h1 class="font-uppercase font-semibold text-lg">ატვირთე სურათი</h1>
        </div>
        <BaseButton
          :height="60"
          class="bg-customRed w-full rounded-full"
          @click.left = "submitReview"
        >
          <p class="font-uppercase text-xl font-bold text-white ">
           შეაფასე
          </p>
        </BaseButton>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped></style>
