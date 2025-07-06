<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {ICategory} from "@/ts/models/category.types.ts"
import {useAppStore} from "@/pinia/app.pinia.ts"
import {useCategoryStore} from "@/pinia/category.pinia.ts"
import {computed, ref, watch} from "vue"
import {useRouter} from "vue-router"

const router = useRouter()

const appStore = useAppStore()
const categoryStore = useCategoryStore()

const isDropdownOpen = ref<boolean>(false)

const activeCategory = ref<number | null>(null)
const activeSubcategory = ref<number | null>(null)

const selectedCategory = ref<ICategory | null>(null)
const selectedSubcategory = ref<ICategory | null>(null)

const categories = computed<ICategory[] | null>(() => {
  return categoryStore.getCategories
})

const computedLanguage = computed(() => appStore.getLanguage)

function openCategory(index: number, category: ICategory): void {
  if (category?.children?.length < 1) {
    activeCategory.value = null
    selectedCategory.value = null
    return
  }
  activeCategory.value = index
  selectedCategory.value = category
  activeSubcategory.value = null
  selectedSubcategory.value = null
  console.log(categories.value)
  console.log(selectedCategory.value?.children?.length)
}

function closeDropdown(): void {
  isDropdownOpen.value = false
}


function openSubcategory(index: number, subCategory: ICategory): void {
  activeSubcategory.value = index
  selectedSubcategory.value = subCategory
}

function moveToCategory(category: ICategory): void {
  router.push(`/products?category=${category.slug}`)
  isDropdownOpen.value = false
}

watch(isDropdownOpen, (value: boolean) => {
  if (!value) {
    setTimeout(() => {
      activeCategory.value = null
      selectedCategory.value = null
      activeSubcategory.value = null
      selectedSubcategory.value = null
    }, 200)
  }
})
</script>

<template>
  <DropdownMenu v-model:open="isDropdownOpen">
    <DropdownMenuTrigger as-child>
      <BaseButton
          :height="48"
          :width="184"
          class="bg-customBlack dark:bg-customDarkGrey"
          @click="isDropdownOpen = true"
      >
        <BaseIcon
            :name="isDropdownOpen ? 'close' : 'menu'"
            :size="24"
            class="text-white"
            rounded
        />
        <p class="font-uppercase text-sm font-bold text-white">
          {{ $t("production") }}
        </p>
      </BaseButton>
    </DropdownMenuTrigger>

    <DropdownMenuContent
        align="start"
        class="rounded-2xl bg-white px-0 py-5 shadow-xl dark:bg-customBlack"

    >
      <div class="flex" @mouseleave="closeDropdown">
        <section class="flex flex-col gap-2.5">
          <h2 class="category-title font-uppercase dark:text-white">
            {{ $t("categories") }}
          </h2>

          <div class="flex max-h-[280px] flex-col flex-wrap gap-2 pr-8">
            <div
                v-for="(category, index) in categories"
                :key="index"
                class="group flex cursor-pointer items-center gap-6 font-semibold hover:text-customRed"
                @click="moveToCategory(category)"
                @mouseenter="openCategory(index, category)"
            >
              <div
                  :class="
                  selectedCategory?.name[computedLanguage] ===
                  category?.name[computedLanguage]
                    ? 'visible'
                    : 'invisible'
                "
                  class="category-selector"
              />
              <div class="flex items-center gap-3">
                <BaseIcon
                    :class="
                    selectedCategory?.name[computedLanguage] ===
                    category.name[computedLanguage]
                      ? 'text-customRed dark:text-customRed'
                      : 'dark:text-white'
                  "
                    :name="category.icon"
                    :size="24"
                    class="transition-all group-hover:text-customRed"
                />
                <p
                    :class="
                    selectedCategory?.name[computedLanguage] ===
                    category.name[computedLanguage]
                      ? 'text-customRed dark:text-customRed'
                      : 'dark:text-white'
                  "
                    class="text-nowrap text-sm font-semibold transition-all group-hover:text-customRed"
                >
                  {{ category?.name[computedLanguage] }}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
            v-if="activeCategory !== null && categories[activeCategory]?.children?.length > 0"
            class="flex min-w-52 flex-col gap-2.5 border-l border-customBlack/10 dark:border-white/10"
        >
          <h2 class="category-title font-uppercase dark:text-white">
            {{ selectedCategory.name[computedLanguage] }}
          </h2>

          <div class="flex max-h-[280px] flex-col flex-wrap gap-1.5 pr-8">
            <div
                v-for="(subcategory, subIndex) in categories[activeCategory]
                .children"
                :key="subIndex"
                class="group flex cursor-pointer items-center gap-7 rounded-lg font-medium text-gray-800"
                @mouseenter="openSubcategory(subIndex, subcategory)"
            >
              <div
                  :class="
                  selectedSubcategory?.name === subcategory.name
                    ? 'visible'
                    : 'invisible'
                "
                  class="category-selector"
              ></div>

              <p
                  :class="
                  selectedSubcategory?.name === subcategory.name
                    ? 'text-customRed dark:text-customRed'
                    : 'dark:text-white'
                "
                  class="text-nowrap text-sm font-semibold text-customBlack/70 transition-all group-hover:text-customRed"
                  @click="moveToCategory(subcategory)"
              >
                {{ subcategory.name[computedLanguage] }}
              </p>
            </div>
          </div>
        </section>

        <section
            v-if="activeSubcategory !== null && selectedSubcategory?.children?.length > 0"
            class="flex min-w-52 flex-col gap-3.5 border-l border-customBlack/10 dark:border-white/10 px-8"
        >
          <h2 class="font-uppercase text-nowrap font-extrabold dark:text-white">
            {{ selectedSubcategory.name[computedLanguage] }}
          </h2>

          <div class="flex max-h-[280px] flex-col flex-wrap gap-[18px]">
            <div
                v-for="(item, itemIndex) in selectedSubcategory.children"
                :key="itemIndex"
                class="group flex cursor-pointer items-center rounded-lg pr-2 font-normal text-gray-600"
            >
              <p
                  class="text-nowrap text-sm font-semibold text-customBlack/70 transition-all dark:text-white group-hover:text-customRed"
              >
                {{ item.name[computedLanguage] }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style lang="css" scoped>
.category-selector {
  @apply h-8 w-1 rounded-r-2xl bg-customRed group-hover:visible;
}

.category-title {
  @apply text-nowrap px-8 font-extrabold;
}
</style>
