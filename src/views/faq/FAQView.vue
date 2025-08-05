<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {EFAQCategory, IFAQ, IFAQCards} from "@/ts/components/faq.types.js"
import {computed, ref} from "vue";
import {FAQAdmin, FAQCards, FAQClients, FAQRetailers} from "@/constants/faq.ts";

const selectedCategory = ref<EFAQCategory>(EFAQCategory.CLIENT)
const selectedQuestion = ref<string>('')

const computedCurrentFAQ = computed<IFAQ[]>(() => {
  switch (selectedCategory.value) {
    case EFAQCategory.CLIENT:
      return FAQClients
    case EFAQCategory.ADMIN:
      return FAQAdmin
    case EFAQCategory.RETAILER:
      return FAQRetailers
    default:
      return FAQClients
  }
})

const computedSelectedQuestion = computed(() => {
  return selectedQuestion.value || ''
})

function selectFAQCategory(faqCard: IFAQCards) {
  selectedCategory.value = faqCard.name
  selectedQuestion.value = '' // Reset question selection when category changes
}

function selectQuestion(question: string) {
  selectedQuestion.value = question
}
</script>

<template>
  <main class="pt-3 pb-20 flex flex-col gap-3">
    <BaseBreadcrumbs :path="['ხშირად დასმული კითხვები']" disable-route/>
    <div class="flex flex-col gap-16  container mx-auto px-4">
      <section class="flex flex-col gap-4">
        <h2 class="text-customBlack text-xl font-extrabold font-uppercase dark:text-customGrey">
          ხშირად დასმული კითხვები
        </h2>

        <!-- Mobile Category Slider -->
        <div class="block md:hidden">
          <div class="relative px-4">
            <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <div
                  v-for="FAQCard in FAQCards"
                  :key="FAQCard.name"
                  class="flex-shrink-0"
                  style="width: 260px;"
              >
                <BaseCard
                    :description="FAQCard.description"
                    :height="139"
                    :icon="FAQCard.icon"
                    :selected="FAQCard.name === selectedCategory"
                    :title="FAQCard.title"
                    @click.left="selectFAQCategory(FAQCard)"
                />
              </div>
            </div>
            <!-- Gradient fade indicator -->
            <div class="absolute right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-customBlack to-transparent pointer-events-none"></div>
          </div>
        </div>

        <!-- Desktop Category Grid -->
        <div class="hidden md:grid grid-cols-4 items-center gap-7 pt-2">
          <BaseCard
              v-for="FAQCard in FAQCards"
              :description="FAQCard.description"
              :height="139"
              :icon="FAQCard.icon"
              :selected="FAQCard.name === selectedCategory"
              :title="FAQCard.title"
              @click.left="selectFAQCategory(FAQCard)"
          />
        </div>
      </section>
      <!-- Mobile FAQ Layout -->
      <div class="block md:hidden">
        <div class="flex flex-col gap-4">
          <h2 class="text-customBlack text-xl font-extrabold font-uppercase dark:text-customGrey">
            კითხვები
          </h2>
          
          <!-- Mobile FAQ Dropdown List -->
          <div class="flex flex-col gap-2">
            <div
                v-for="FAQItem in computedCurrentFAQ"
                :key="FAQItem.value"
                class="border border-customBlack/10 dark:border-white/10 rounded-lg bg-white dark:bg-customBlack overflow-hidden"
            >
              <!-- Question Button -->
              <button
                  class="w-full h-11 px-3 py-3.5 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between text-customBlack dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  @click="selectQuestion(FAQItem.value === computedSelectedQuestion ? '' : FAQItem.value)"
              >
                <span>{{ FAQItem.question }}</span>
                <BaseIcon
                    :class="{
                      'rotate-180': FAQItem.value === computedSelectedQuestion
                    }"
                    :size="16"
                    class="transition-transform duration-200 text-customBlack dark:text-white"
                    name="expand_more"
                />
              </button>
              
              <!-- Answer Dropdown -->
              <div
                  v-show="FAQItem.value === computedSelectedQuestion"
                  class="border-t border-customBlack/10 dark:border-white/10 bg-white dark:bg-customBlack"
                  style="padding: 14px 12px;"
              >
                <div class="flex flex-col gap-4">
                  <p class="dark:text-white text-sm leading-relaxed">{{ FAQItem.answer }}</p>
                  <div class="flex flex-col gap-3">
                    <p class="text-sm font-medium dark:text-white">
                      დაგეხმარა ეს პასუხი?
                    </p>
                    <div class="flex items-center gap-4">
                      <BaseButton
                          :height="44"
                          :width="56"
                          class="bg-customGrey dark:bg-customDarkGrey"
                      >
                        <BaseIcon
                            :size="20"
                            class="dark:text-white"
                            name="thumb_up"
                            rounded
                        />
                      </BaseButton>
                      <BaseButton
                          :height="44"
                          :width="56"
                          class="bg-customGrey dark:bg-customDarkGrey"
                      >
                        <BaseIcon
                            :size="20"
                            class="dark:text-white"
                            name="thumb_down"
                            rounded
                        />
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop FAQ Layout -->
      <div class="hidden md:block">
        <Tabs :default-value="computedCurrentFAQ[0].value" class="grid grid-cols-6 gap-6">
          <TabsList class="col-span-2 flex flex-col h-fit">
            <h2 class="font-extrabold font-uppercase pl-6 dark:text-white">
              კითხვები
            </h2>
            <div class="flex flex-col items-start gap-2 pt-2">
              <TabsTrigger
                  v-for="FAQItem in computedCurrentFAQ"
                  :key="FAQItem.value"
                  :value="FAQItem.value"
              >
                {{ FAQItem.question }}
              </TabsTrigger>
            </div>
          </TabsList>
          <TabsContent
              v-for="FAQItem in computedCurrentFAQ"
              :key="FAQItem.value"
              :value="FAQItem.value"
              class="col-span-4"
          >
            <div class="flex flex-col justify-between h-full">
              <p class="dark:text-white">{{ FAQItem.answer }}</p>
              <div class="flex flex-col gap-3">
                <p class="text-sm font-medium dark:text-white">
                  დაგეხმარა ეს პასუხი?
                </p>
                <div class="flex items-center gap-4">
                  <BaseButton
                      :height="44"
                      :width="56"
                      class="bg-customGrey dark:bg-customDarkGrey"
                  >
                    <BaseIcon
                        :size="20"
                        class="dark:text-white"
                        name="thumb_up"
                        rounded
                    />
                  </BaseButton>
                  <BaseButton
                      :height="44"
                      :width="56"
                      class="bg-customGrey dark:bg-customDarkGrey"
                  >
                    <BaseIcon
                        :size="20"
                        class="dark:text-white"
                        name="thumb_down"
                        rounded
                    />
                  </BaseButton>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </main>
</template>
