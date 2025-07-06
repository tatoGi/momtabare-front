<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue"
import FAQAccordion from "@/components/faq/FAQAccordion.vue"
import { Accordion } from "@/components/ui/accordion"
import { FAQItems } from "@/constants/faq.ts"
</script>

<template>
  <div class="flex justify-between flex-col md:flex-row h-[700px]">
    <div>
      <div class="flex flex-col gap-3 mb-7">
        <h2 class="text-3xl font-extrabold font-uppercase dark:text-white">
          ხშირად დასმული კითხვები
        </h2>
        <p class="text-customBlack/70 dark:text-white/70 text-sm font-medium">
          ყველაფერი რაც თქვენ უნდა იცოდეთ პლათფორმაზე რეგისტრაციიდან ნებისმიერი
          ნივთის ქირაობამდე.
        </p>
      </div>
      <Accordion
        class="flex flex-col gap-5 max-w-[700px]"
        collapsible
        type="single"
      >
        <FAQAccordion :FAQItems="FAQItems" />
      </Accordion>
    </div>
    <div>
      <div class="relative h-[619px] pr-28">
        <img
          alt="photo"
          class="object-contain rounded-2xl"
          src="../../assets/img/ski.png"
        />
        <div
          class="absolute bg-customBlue rounded-2xl w-[391px] h-[220px] bottom-16 -right-0 flex flex-col gap-3 px-8 py-6"
        >
          <h2 class="text-white text-xl font-extrabold font-uppercase">
            ისევ ეძებ პასუხებს?
          </h2>
          <p class="text-white text-sm font-medium">
            შენი მომდევნო თავგადასავლის დასაგეგმად ყველა საჭირო ინფორმაციით ჩვენ
            მოგამარაგებთ.
          </p>
          <BaseButton
            :height="44"
            :width="179"
            class="bg-customBlack text-white text-xs font-extrabold font-uppercase mt-2"
          >
            დაგვიკავშირდი
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
