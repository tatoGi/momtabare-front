<script lang="ts" setup>
import BaseBreadcrumbs from "@/components/base/BaseBreadcrumbs.vue"
import BaseButton from "@/components/base/BaseButton.vue"
import BaseCard from "@/components/base/BaseCard.vue"
import BaseIcon from "@/components/base/BaseIcon.vue"
import LoadingWrapper from "@/components/common/LoadingWrapper.vue"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {computed, ref, onMounted, watch} from "vue";
import { usePageData } from '@/composables/usePageData';
import { useAppStore } from '@/pinia/app.pinia';
import { useLoadingState } from '@/composables/useLoadingState';
import type { IPost } from '@/ts/models/page.types';

// Dynamic FAQ interfaces
interface DynamicFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: string;
}

interface FAQCategory {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  count: number;
}

const appStore = useAppStore();
const { currentPageData } = usePageData();
const faqLoading = useLoadingState();

const selectedCategory = ref<string>('CLIENT');
const selectedQuestion = ref<string>('');
const faqPosts = ref<IPost[]>([]);
const faqCategories = ref<FAQCategory[]>([]);

// Get post attribute value by key and locale
const getPostAttribute = (post: IPost, key: string): string => {
  const currentLocale = appStore.getLanguage === 'ka' ? 'ka' : 'en';
  
  // Try to find attribute with current locale first
  let attr = post.attributes.find(a => 
    a.attribute_key === key && a.locale === currentLocale
  );
  
  // Fallback to attribute without locale or English
  if (!attr) {
    attr = post.attributes.find(a => 
      a.attribute_key === key && (!a.locale || a.locale === 'en')
    );
  }
  
  return attr ? attr.attribute_value : '';
};

// Process backend posts into FAQ format
const processedFAQs = computed<DynamicFAQ[]>(() => {
  return faqPosts.value
    .filter(post => post.active && getPostAttribute(post, 'status') === 'active')
    .map(post => ({
      id: post.id,
      question: getPostAttribute(post, 'question'),
      answer: getPostAttribute(post, 'answer'),
      category: getPostAttribute(post, 'category'),
      order: parseInt(getPostAttribute(post, 'order')) || 0,
      status: getPostAttribute(post, 'status')
    }))
    .filter(faq => faq.question && faq.answer)
    .sort((a, b) => a.order - b.order);
});

// Generate dynamic categories from posts
const generateCategories = () => {
  const categoryMap = new Map<string, number>();
  
  processedFAQs.value.forEach(faq => {
    categoryMap.set(faq.category, (categoryMap.get(faq.category) || 0) + 1);
  });

  const categoryConfig: Record<string, { title: string; description: string; icon: string }> = {
    'CLIENT': {
      title: 'კლიენტები',
      description: 'კლიენტებისთვის განკუთვნილი კითხვები',
      icon: 'user'
    },
    'RETAILER': {
      title: 'რიტეილერები', 
      description: 'რიტეილერებისთვის განკუთვნილი კითხვები',
      icon: 'store'
    },
    'ADMIN': {
      title: 'ადმინისტრაცია',
      description: 'ადმინისტრაციული კითხვები',
      icon: 'settings'
    }
  };

  faqCategories.value = Array.from(categoryMap.entries()).map(([category, count]) => ({
    id: category,
    name: category,
    title: categoryConfig[category]?.title || category,
    description: categoryConfig[category]?.description || `${category} კითხვები`,
    icon: categoryConfig[category]?.icon || 'help-circle',
    count
  }));

  // Set default category if none selected
  if (faqCategories.value.length > 0 && !selectedCategory.value) {
    selectedCategory.value = faqCategories.value[0].id;
  }
};

// Get FAQs for selected category
const computedCurrentFAQ = computed<DynamicFAQ[]>(() => {
  return processedFAQs.value.filter(faq => faq.category === selectedCategory.value);
});

const computedSelectedQuestion = computed(() => {
  return selectedQuestion.value || '';
});

// Load FAQ data from page data
const loadFAQData = async () => {
  await faqLoading.withLoading(async () => {
    try {
      if (currentPageData.value && currentPageData.value.posts) {
        faqPosts.value = currentPageData.value.posts;
        generateCategories();
        console.log('📋 Loaded FAQ posts:', faqPosts.value.length);
        console.log('📂 Generated categories:', faqCategories.value);
      } else {
        console.warn('⚠️ No FAQ posts found in page data');
      }
    } catch (error) {
      console.error('❌ Error loading FAQ data:', error);
      throw error;
    }
  });
};

// Retry loading FAQ data
const retryLoadFAQ = () => {
  loadFAQData();
};

function selectFAQCategory(faqCategory: FAQCategory) {
  selectedCategory.value = faqCategory.id;
  selectedQuestion.value = ''; // Reset question selection when category changes
}

function selectQuestion(questionId: string) {
  selectedQuestion.value = questionId;
}

// Watch for language changes and reload data
watch(() => appStore.getLanguage, () => {
  generateCategories();
});

// Load data on mount
onMounted(() => {
  loadFAQData();
});
</script>

<template>
  <main class="pt-3 pb-20 flex flex-col gap-3">
    <BaseBreadcrumbs :path="['ხშირად დასმული კითხვები']" disable-route/>
    
    <LoadingWrapper
      :loading="faqLoading.loading.value"
      :error="faqLoading.error.value"
      @retry="retryLoadFAQ"
      loading-text="FAQ-ების ჩატვირთვა..."
    >
      <div class="flex flex-col gap-16 container mx-auto px-4">
        <section class="flex flex-col gap-4">
          <h2 class="text-customBlack text-xl font-extrabold font-uppercase dark:text-customGrey">
            ხშირად დასმული კითხვები
          </h2>

          <!-- Mobile Category Slider -->
          <div class="block md:hidden" v-if="faqCategories.length > 0">
            <div class="relative px-4">
              <div class="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <div
                    v-for="faqCategory in faqCategories"
                    :key="faqCategory.id"
                    class="flex-shrink-0"
                    style="width: 260px;"
                >
                  <BaseCard
                      :description="faqCategory.description"
                      :height="139"
                      :icon="faqCategory.icon"
                      :selected="faqCategory.id === selectedCategory"
                      :title="faqCategory.title"
                      @click.left="selectFAQCategory(faqCategory)"
                  />
                </div>
              </div>
              <!-- Gradient fade indicator -->
              <div class="absolute right-4 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-customBlack to-transparent pointer-events-none"></div>
            </div>
          </div>

          <!-- Desktop Category Grid -->
          <div class="hidden md:grid grid-cols-4 items-center gap-7 pt-2" v-if="faqCategories.length > 0">
            <BaseCard
                v-for="faqCategory in faqCategories"
                :key="faqCategory.id"
                :description="faqCategory.description"
                :height="139"
                :icon="faqCategory.icon"
                :selected="faqCategory.id === selectedCategory"
                :title="faqCategory.title"
                @click.left="selectFAQCategory(faqCategory)"
            />
          </div>

          <!-- No Categories Message -->
          <div v-else class="text-center py-12">
            <BaseIcon name="help-circle" class="w-16 h-16 mx-auto mb-4 text-gray-400"/>
            <h3 class="text-lg font-medium text-customBlack dark:text-customGrey mb-2">FAQ კატეგორიები არ მოიძებნა</h3>
            <p class="text-gray-600 dark:text-gray-400">
              ამჟამად FAQ კითხვები არ არის ხელმისაწვდომი
            </p>
          </div>
        </section>

        <!-- FAQ Content -->
        <div v-if="faqCategories.length > 0">
          <!-- Mobile FAQ Layout -->
          <div class="block md:hidden">
            <div class="flex flex-col gap-4">
              <h2 class="text-customBlack text-xl font-extrabold font-uppercase dark:text-customGrey">
                კითხვები
              </h2>
              
              <!-- Mobile FAQ Dropdown List -->
              <div class="flex flex-col gap-2" v-if="computedCurrentFAQ.length > 0">
                <div
                    v-for="faq in computedCurrentFAQ"
                    :key="faq.id"
                    class="border border-customBlack/10 dark:border-white/10 rounded-lg bg-white dark:bg-customBlack overflow-hidden"
                >
                  <!-- Question Button -->
                  <button
                      class="w-full h-11 px-3 py-3.5 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between text-customBlack dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      @click="selectQuestion(faq.id.toString() === computedSelectedQuestion ? '' : faq.id.toString())"
                  >
                    <span>{{ faq.question }}</span>
                    <BaseIcon
                        :class="{
                          'rotate-180': faq.id.toString() === computedSelectedQuestion
                        }"
                        :size="16"
                        class="transition-transform duration-200 text-customBlack dark:text-white"
                        name="expand_more"
                    />
                  </button>
                  
                  <!-- Answer Dropdown -->
                  <div
                      v-show="faq.id.toString() === computedSelectedQuestion"
                      class="border-t border-customBlack/10 dark:border-white/10 bg-white dark:bg-customBlack"
                      style="padding: 14px 12px;"
                  >
                    <div class="flex flex-col gap-4">
                      <div class="dark:text-white text-sm leading-relaxed" v-html="faq.answer"></div>
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

              <!-- No FAQs in Category (Mobile) -->
              <div v-else class="text-center py-12">
                <BaseIcon name="help-circle" class="w-16 h-16 mx-auto mb-4 text-gray-400"/>
                <h3 class="text-lg font-medium text-customBlack dark:text-customGrey mb-2">კითხვები არ მოიძებნა</h3>
                <p class="text-gray-600 dark:text-gray-400">
                  ამ კატეგორიაში ამჟამად კითხვები არ არის ხელმისაწვდომი
                </p>
              </div>
            </div>
          </div>

          <!-- Desktop FAQ Layout -->
          <div class="hidden md:block">
            <Tabs :default-value="computedCurrentFAQ[0]?.id.toString()" class="grid grid-cols-6 gap-6" v-if="computedCurrentFAQ.length > 0">
              <TabsList class="col-span-2 flex flex-col h-fit">
                <h2 class="font-extrabold font-uppercase pl-6 dark:text-white">
                  კითხვები
                </h2>
                <div class="flex flex-col items-start gap-2 pt-2">
                  <TabsTrigger
                      v-for="faq in computedCurrentFAQ"
                      :key="faq.id"
                      :value="faq.id.toString()"
                  >
                    {{ faq.question }}
                  </TabsTrigger>
                </div>
              </TabsList>
              <TabsContent
                  v-for="faq in computedCurrentFAQ"
                  :key="faq.id"
                  :value="faq.id.toString()"
                  class="col-span-4"
              >
                <div class="flex flex-col justify-between h-full">
                  <div class="dark:text-white" v-html="faq.answer"></div>
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

            <!-- No FAQs in Category (Desktop) -->
            <div v-else class="text-center py-12">
              <BaseIcon name="help-circle" class="w-16 h-16 mx-auto mb-4 text-gray-400"/>
              <h3 class="text-lg font-medium text-customBlack dark:text-customGrey mb-2">კითხვები არ მოიძებნა</h3>
              <p class="text-gray-600 dark:text-gray-400">
                ამ კატეგორიაში ამჟამად კითხვები არ არის ხელმისაწვდომი
              </p>
            </div>
          </div>
        </div>
      </div>
    </LoadingWrapper>
  </main>
</template>
