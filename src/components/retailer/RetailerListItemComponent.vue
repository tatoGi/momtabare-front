<script lang="ts" setup>
import {IUser} from '../../ts/models/user.types';

import BaseIcon from '../base/BaseIcon.vue';
import {useRouter} from 'vue-router';
import {computed, onMounted, ref} from "vue";

const router = useRouter()
const props = defineProps<{
  user: IUser
}>()

const ownerImg = ref<string>('')
const computedUserInitials = computed(() => {
  const firstInitial = props.user.first_name?.[0] ?? '';
  const lastInitial = props.user.last_name?.[0] ?? '';
  return (firstInitial + lastInitial).toUpperCase();
});

const computedUserFullName = computed<string>(() => {
  return `${props.user.first_name} ${props.user.last_name}`
})

onMounted(async () => {
  const randomIndex = Math.floor(Math.random() * 8) + 1
  const mod = await import(`../../assets/img/OwnerTemp${randomIndex}.png`)
  ownerImg.value = mod.default
})

function navigateToRetailer(): void {
  router.push({path: `/retailer/${props.user.id}`})
}
</script>

<template>
  <div v-if="user.is_retailer === 1"
       class="border border-customBlack/10 dark:border-white/10 hover:border-customRed dark:hover:border-customRed cursor-pointer flex gap-6 p-5 rounded-xl items-center"
       @click="navigateToRetailer"
  >
    <div class="bg-customRed rounded-full w-16 h-16 flex-center flex-shrink-0">
      <h2 class="text-customGrey font-bold font-uppercase pb-1">{{ computedUserInitials }}</h2>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex gap-2 items-center">
        <h1 class="text-customBlack dark:text-customGrey">{{ computedUserFullName }}</h1>
        <BaseIcon :size="20" class="text-customBlue" name="verified"/>
      </div>

      <h1 class="text-sm text-customBlack/50 dark:text-white/70 font-semibold">{{ user.products_amount }} პროდუქცია</h1>
    </div>

  </div>
</template>

