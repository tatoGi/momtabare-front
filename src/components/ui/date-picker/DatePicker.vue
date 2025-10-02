<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: Date | null
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'აირჩიე თარიღი',
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

const isOpen = ref(false)

const formattedDate = computed(() => {
  if (!props.modelValue) return ''
  const date = new Date(props.modelValue)
  return date.toLocaleDateString('ka-GE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

function selectDate(date: Date | null) {
  emit('update:modelValue', date)
  if (date) {
    isOpen.value = false
  }
}

function clearDate() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      :class="[
        'w-full flex items-center justify-between px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        props.class
      ]"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center">
        <span class="mr-2">📅</span>
        <span :class="!props.modelValue ? 'text-gray-500' : ''">
          {{ formattedDate || props.placeholder }}
        </span>
      </div>
      <span 
        v-if="props.modelValue" 
        class="cursor-pointer text-gray-400 hover:text-gray-600" 
        @click.stop="clearDate"
      >
        ✕
      </span>
    </button>
    
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-gray-300 rounded-md shadow-lg"
    >
      <VDatePicker
        :model-value="props.modelValue"
        @update:model-value="selectDate"
        color="red"
        style="width: 100%"
      />
    </div>
  </div>
</template>