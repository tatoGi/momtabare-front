<script lang="ts" setup>
import {onBeforeMount, ref} from 'vue';
import {getAllUsers} from '../../services/user';
import {IUser} from '../../ts/models/user.types';
import RetailerListItemComponent from './RetailerListItemComponent.vue';
import BaseBreadcrumbs from '../base/BaseBreadcrumbs.vue';
import {userSortingOptions} from '../../constants/userSortingOptions';
import BaseSelect from '../base/BaseSelect.vue';
import BaseIcon from "@/components/base/BaseIcon.vue";
import {Skeleton} from "@/components/ui/skeleton";

const users = ref<IUser[]>([]);
const retailersLoading = ref<boolean>(false);

const sortBy = ref<string>("პოპულარული")
const sortByIsOpen = ref<boolean>(false)


const retailers = ref<IUser[] | null>(null)

onBeforeMount(async () => {

  retailersLoading.value = true
  try {
    const response = await getAllUsers();
    if (!response) return

    users.value = response.users;
    retailers.value = users.value.filter((item) => item.is_retailer === 1);
  } catch (e: any) {
    console.log(e)
  } finally {
    retailersLoading.value = false
  }
});
</script>

<template>
  <div class="py-5">
    <BaseBreadcrumbs prepend-path="retailers"/>
    <div class="flex items-end justify-between border-b pb-5">
      <div class="flex flex-col items-start gap-1">
        <h1 class="text-customBlack font-uppercase font-extrabold text-xl dark:text-customGrey"> გამქირავებლები </h1>
        <h1 v-if="retailers" class="text-customRed">{{ retailers.length }} გამქირავებელი </h1>
      </div>

      <div class="flex items-center gap-1">
        <p class="text-sm text-black/70 dark:text-white/70">დალაგება:</p>
        <BaseSelect
            v-model="sortBy"
            v-model:isOpen="sortByIsOpen"
            :options="userSortingOptions.map((val: any) => val.label)"
        >
          <template #trigger>
            <div class="flex cursor-pointer items-center gap-1">
              <p class="text-sm font-medium text-black dark:text-customGrey">{{ sortBy }}</p>
              <BaseIcon
                  :class="{
                  '-rotate-180': sortByIsOpen,
                }"
                  :size="22"
                  class="text-black/70 dark:text-customGrey transition"
                  name="keyboard_arrow_down"
              />
            </div>
          </template>
        </BaseSelect>
      </div>
    </div>

    <transition name="fade">
      <div v-if="!retailersLoading" class="grid grid-cols-4 gap-8 py-5">
        <RetailerListItemComponent v-for="user in users" :user="user"/>
      </div>
      <div v-else class="grid grid-cols-4 gap-8 py-5 mb-[1000px]">
        <Skeleton v-for="i in 16" :key="i" class="animate-pulse h-[100px] rounded-xl"/>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
