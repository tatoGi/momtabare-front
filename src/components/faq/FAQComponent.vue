<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import FAQAccordion from "@/components/faq/FAQAccordion.vue"
import { Accordion } from "@/components/ui/accordion"
import { FAQItems } from "@/constants/faq.ts"
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 h-auto container px-4 md:px-0 py-10 md:py-0 relative">
    <div>
      <div class="flex flex-col gap-3 mb-7 text-center md:text-left max-w-[627px]">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          ხშირად დასმული კითხვები
        </h2>
        <p class="text-customBlack/70 dark:text-white/70 text-sm font-medium">
          ყველაფერი რაც თქვენ უნდა იცოდეთ პლათფორმაზე რეგისტრაციიდან ნებისმიერი
          ნივთის ქირაობამდე.
        </p>
      </div>
      <Accordion class="flex flex-col gap-5 max-w-[627px]" collapsible type="single">
        <FAQAccordion :FAQItems="FAQItems" />
      </Accordion>
    </div>
    <div class="relative mt-10 md:mt-0">
      <div class="relative h-[250px] md:h-[619px] w-full">
        <img alt="photo" class="object-cover w-full h-full" src="../../assets/img/ski.png" />
      </div>
      <div class="md:absolute md:bottom-16 md:right-0  md:mt-0 md:-translate-y-1/2 blue-content">
        <div class="bg-customBlue  w-full md:w-[391px] h-auto md:h-[220px] flex flex-col gap-3 p-6 md:px-8 md:py-6 rounded-2xl">
          <h2 class="text-white text-xl font-extrabold font-uppercase">
            ისევ ეძებ პასუხებს?
          </h2>
          <p class="text-white text-sm font-medium">
            შენი მომდევნო თავგადასავლის დასაგეგმად ყველა საჭირო ინფორმაციით ჩვენ
            მოგამარაგებთ.
          </p>
          <BaseButton :height="44" :width="179"
            class="bg-customBlack text-white text-xs font-extrabold font-uppercase mt-2 w-full md:w-auto">
            დაგვიკავშირდი
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
