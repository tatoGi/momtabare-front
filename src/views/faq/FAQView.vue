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

function selectFAQCategory(faqCard: IFAQCards) {
  selectedCategory.value = faqCard.name
}
</script>

<template>
  <main class="pt-3 pb-20 flex flex-col gap-3">
    <BaseBreadcrumbs :path="['ხშირად დასმული კითხვები']" disable-route/>
    <div class="flex flex-col gap-16">
      <section class="flex flex-col gap-4">
        <h2 class="text-customBlack text-xl font-extrabold font-uppercase dark:text-customGrey">
          ხშირად დასმული კითხვები
        </h2>

        <div class="grid grid-cols-4 items-center gap-7 pt-2">
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
  </main>
</template>
