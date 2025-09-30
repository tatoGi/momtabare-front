<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: { start: Date | null; end: Date | null }
  placeholder?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: null, end: null }),
  placeholder: 'აირჩიე პერიოდი',
  class: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: { start: Date | null; end: Date | null }]
}>()

const isOpen = ref(false)

const formattedDateRange = computed(() => {
  if (!props.modelValue?.start || !props.modelValue?.end) return ''
  
  const startDate = new Date(props.modelValue.start)
  const endDate = new Date(props.modelValue.end)
  
  const startFormatted = startDate.toLocaleDateString('ka-GE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  const endFormatted = endDate.toLocaleDateString('ka-GE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  return `${startFormatted} - ${endFormatted}`
})

function selectDateRange(dates: { start: Date | null; end: Date | null }) {
  emit('update:modelValue', dates)
  if (dates.start && dates.end) {
    isOpen.value = false
  }
}

function clearDateRange() {
  emit('update:modelValue', { start: null, end: null })
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
        <span :class="!props.modelValue?.start || !props.modelValue?.end ? 'text-gray-500' : ''">
          {{ formattedDateRange || props.placeholder }}
        </span>
      </div>
      <span 
        v-if="props.modelValue?.start && props.modelValue?.end" 
        class="cursor-pointer text-gray-400 hover:text-gray-600" 
        @click.stop="clearDateRange"
      >
        ✕
      </span>
    </button>
    
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-gray-300 rounded-md shadow-lg"
    >
      <VDatePicker
        v-model="props.modelValue"
        mode="range"
        color="red"
        style="width: 100%"
        @update:model-value="selectDateRange"
      />
    </div>
  </div>
</template>
