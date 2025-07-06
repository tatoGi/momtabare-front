<script lang="ts" setup>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

defineProps<{
  title: string
  description: string
}>()

const emit = defineEmits(["action"])
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <slot />
    </AlertDialogTrigger>

    <AlertDialogContent class="gap-9">
      <AlertDialogHeader class="gap-7">
        <AlertDialogTitle class="text-xl font-extrabold font-uppercase"
          >{{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          თქვენ შლით ჩანთიდან პროდუქტს
          <span class="font-bold">"{{ description }}"</span>
          ნამდვილად გსურთ ამ ქმედების განხორციელება?
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>არა, არ მსურს</AlertDialogCancel>
        <AlertDialogAction @click.left="emit('action')"
          >კი, მსურს</AlertDialogAction
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
