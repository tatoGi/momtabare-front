<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a href="/"
            class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-400 dark:hover:text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path
                d="M1.33398 8.14457C1.33398 7.68464 1.33398 7.45469 1.38882 7.24292C1.43739 7.05534 1.51722 6.87891 1.62438 6.7223C1.74535 6.54551 1.91326 6.40433 2.24909 6.12197L7.27302 1.89808C7.53324 1.67929 7.66339 1.56988 7.8071 1.52783C7.93384 1.49072 8.06747 1.49072 8.19421 1.52783C8.33791 1.56988 8.46806 1.67929 8.72828 1.89808L13.7522 6.12198C14.0881 6.40433 14.256 6.54551 14.3769 6.7223C14.4841 6.87891 14.5639 7.05534 14.6125 7.24292C14.6673 7.45469 14.6673 7.68464 14.6673 8.14457V13.9377C14.6673 14.8346 14.6673 15.283 14.5058 15.6256C14.3638 15.9269 14.1372 16.1719 13.8584 16.3254C13.5415 16.5 13.1267 16.5 12.2969 16.5H3.70435C2.87464 16.5 2.45979 16.5 2.14289 16.3254C1.86413 16.1719 1.63749 15.9269 1.49546 15.6256C1.33398 15.283 1.33398 14.8346 1.33398 13.9377V8.14457Z"
                stroke="#141414" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
           
          </a>
        </li>
        <li aria-current="page">
          <div class="flex items-center">
            /
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400 ml-2">{{ $t('blogs') }}</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Mobile Category Slider -->
    <div class="block md:hidden mb-6">
      <h2 class="text-lg font-bold mb-3 dark:text-white">{{ $t('blogs') }}</h2>
      <div class="relative">
        <div class="flex overflow-x-auto scrollbar-hide space-x-3 pb-2" ref="categorySlider">
          <button v-for="category in categories" :key="category.id"
            class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200"
            :class="activeCategory === category.id 
              ? '' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-[#F44000] hover:text-[#F44000]'"
            :style="activeCategory === category.id ? 'background-color: rgba(244, 64, 0, 0.1); color: rgba(244, 64, 0, 1); border: none;' : ''"
            @click="activeCategory = category.id">
            <span class="text-sm font-medium whitespace-nowrap" :style="activeCategory === category.id ? 'color: rgba(244, 64, 0, 1);' : ''">{{ category.name }}</span>
            <span class="text-xs rounded-full px-2 py-0.5 min-w-[20px]" 
                  :class="activeCategory === category.id 
                    ? '' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
                  :style="activeCategory === category.id ? 'background-color: rgba(244, 64, 0, 0.1); color: rgba(244, 64, 0, 1);' : ''">{{ category.count }}</span>
          </button>
        </div>
        <!-- Scroll indicators -->
        <div
          class="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none">
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Desktop Sidebar -->
      <div class="hidden md:block w-full md:w-1/4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
          <h2 class="text-xl font-bold mb-4 dark:text-white">{{ $t('categories') }}</h2>
          <ul class="space-y-2">
            <li v-for="category in categories" :key="category.id"
              class="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors group"
              :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-700': activeCategory !== category.id }"
              @click="activeCategory = category.id">
              <span class="text-sm transition-colors" :class="activeCategory === category.id
                ? 'text-[#F44000]'
                : 'group-hover:text-[#F44000]'">{{ category.name }}</span>
              <span class="text-xs rounded-full px-2 py-1 transition-colors" :class="activeCategory === category.id
                ? 'bg-gray-100 dark:bg-gray-700 text-[#F44000]'
                : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-[#F44000] group-hover:text-white'">{{
                category.count }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Blog Posts -->
      <div class="w-full md:w-3/4">
        <!-- Mobile: Single column grid -->
        <div class="grid grid-cols-1 md:hidden gap-4">
          <div v-for="post in blogPosts" :key="post.id" class="block cursor-pointer" @click="goToPost(post)">
            <BlogItem :post="post" />
          </div>
        </div>

        <!-- Desktop: Three column grid -->
        <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="post in blogPosts" :key="post.id" class="block cursor-pointer" @click="goToPost(post)">
            <BlogItem :post="post" />
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-1">
            <!-- Previous Button -->
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-2 rounded-full transition-colors"
              :class="{
                'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': currentPage > 1,
                'text-gray-400 dark:text-gray-600 cursor-not-allowed': currentPage === 1
              }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Page Numbers -->
            <template v-for="page in pageNumbers" :key="page">
              <button 
                v-if="typeof page === 'number'"
                @click="goToPage(page)"
                class="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                :class="{
                  'bg-[#F44000] text-white': currentPage === page,
                  'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': currentPage !== page
                }">
                {{ page }}
              </button>
              <span 
                v-else
                class="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                {{ page }}
              </span>
            </template>

            <!-- Next Button -->
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-full transition-colors"
              :class="{
                'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': currentPage < totalPages,
                'text-gray-400 dark:text-gray-600 cursor-not-allowed': currentPage === totalPages
              }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>

        <!-- Pagination Info -->
        <div v-if="totalPages > 1" class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {{ $t('showing') }} {{ (currentPage - 1) * postsPerPage + 1 }} - 
          {{ Math.min(currentPage * postsPerPage, filteredPosts.length) }} 
          {{ $t('of') }} {{ filteredPosts.length }} {{ $t('posts') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import BlogItem from '@/components/blog/BlogItem.vue';
import blogImage from '@/assets/img/blogItem.png';
import { usePageData } from '@/composables/usePageData';
import { useAppStore } from '@/pinia/app.pinia';
import { getAssetUrl } from '@/utils/config/env';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string | number;
  image: string;
  slug: string;
  author?: string;
  meta_title?: string;
  meta_description?: string;
}

export default defineComponent({
  name: 'BlogView',
  components: {
    BlogItem
  },
  setup() {
    const router = useRouter();
    const appStore = useAppStore();
    const activeCategory = ref('all');
    const currentPage = ref(1);
    const postsPerPage = ref(6); // Number of posts per page
    
    // Get page data from router
    const { currentPageData, pageTitle, pageContent, pageKeywords } = usePageData();

    // Get current locale
    const currentLocale = computed(() => appStore.getLanguage);

    // Helper function to get attribute value by key and locale
    const getPostAttribute = (post: any, key: string, locale?: string) => {
      if (!post.attributes) return '';

      // Try to find attribute with specific locale first
      if (locale) {
        const localeAttr = post.attributes.find((attr: any) => 
          attr.attribute_key === key && attr.locale === locale
        );
        if (localeAttr) return localeAttr.attribute_value;
      }

      // Fallback to attribute without locale or first match
      const attr = post.attributes.find((attr: any) => 
        attr.attribute_key === key && (!attr.locale || attr.locale === 'en')
      );
      return attr ? attr.attribute_value : '';
    };

    // Process backend blog posts
    const processedBlogPosts = computed(() => {
      if (!currentPageData.value?.posts) return [];

      return currentPageData.value.posts.map((post: any) => {
        const locale = currentLocale.value;

        return {
          id: post.id,
          title: getPostAttribute(post, 'title', locale) || getPostAttribute(post, 'title', 'en'),
          content: getPostAttribute(post, 'content', locale) || getPostAttribute(post, 'content', 'en'),
          date: getPostAttribute(post, 'published_at') || post.published_at || post.created_at,
          image: getPostAttribute(post, 'featured_image') ? 
            getAssetUrl(`storage/${getPostAttribute(post, 'featured_image')}`) : 
            blogImage,
          category: post.category?.slug || 'general',
          slug: getPostAttribute(post, 'slug', locale) || getPostAttribute(post, 'slug', 'en'),
          author: getPostAttribute(post, 'author') || 'Unknown',
          meta_title: getPostAttribute(post, 'meta_title', locale) || getPostAttribute(post, 'meta_title', 'en'),
          meta_description: getPostAttribute(post, 'meta_description', locale) || getPostAttribute(post, 'meta_description', 'en')
        };
      });
    });

    const goToPost = (post: BlogPost) => {
      const slug = post.slug || post.id.toString();
      router.push({
        name: 'blog-show',
        params: { slug: slug }
      });
    };

    // Generate categories dynamically from backend blog posts
    const categories = computed(() => {
      if (!processedBlogPosts.value.length) {
        return [{ id: 'all', name: 'ყველა სიახლე', count: 0 }];
      }

      // Count posts by category
      const categoryCount: Record<string, number> = {};
      const categoryNames: Record<string, string> = {};
      
      processedBlogPosts.value.forEach(post => {
        const categorySlug = post.category || 'general';
        categoryCount[categorySlug] = (categoryCount[categorySlug] || 0) + 1;
        
        // Try to get category name from the post's category object if available
        if (currentPageData.value?.posts) {
          const originalPost = currentPageData.value.posts.find(p => p.id === post.id);
          if (originalPost?.category) {
            // Get localized category name
            const locale = currentLocale.value;
            const categoryTranslation = originalPost.category.translations?.find(
              (t: any) => t.locale === locale
            ) || originalPost.category.translations?.[0];
            
            if (categoryTranslation) {
              categoryNames[categorySlug] = categoryTranslation.name || categoryTranslation.title;
            } else {
              // Fallback to slug with first letter capitalized
              categoryNames[categorySlug] = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
            }
          }
        }
        
        // Fallback category name if not found
        if (!categoryNames[categorySlug]) {
          categoryNames[categorySlug] = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
        }
      });

      // Create categories array
      const dynamicCategories = [
        { 
          id: 'all', 
          name: 'ყველა სიახლე', 
          count: processedBlogPosts.value.length 
        }
      ];

      // Add categories from posts
      Object.entries(categoryCount).forEach(([slug, count]) => {
        dynamicCategories.push({
          id: slug,
          name: categoryNames[slug],
          count
        });
      });

      return dynamicCategories;
    });

    // Filter posts by category
    const filteredPosts = computed(() => {
      if (activeCategory.value === 'all') {
        return processedBlogPosts.value;
      }
      return processedBlogPosts.value.filter(post => post.category === activeCategory.value);
    });

    // Calculate total pages
    const totalPages = computed(() => {
      return Math.ceil(filteredPosts.value.length / postsPerPage.value);
    });

    // Get paginated posts for current page
    const paginatedPosts = computed(() => {
      const start = (currentPage.value - 1) * postsPerPage.value;
      const end = start + postsPerPage.value;
      return filteredPosts.value.slice(start, end);
    });

    // Use paginated posts for display
    const blogPosts = paginatedPosts;

    // Pagination functions
    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Scroll to top of blog posts section
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        goToPage(currentPage.value + 1);
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        goToPage(currentPage.value - 1);
      }
    };

    // Reset to first page when category changes
    watch(activeCategory, () => {
      currentPage.value = 1;
    });

    // Generate page numbers for pagination display
    const pageNumbers = computed(() => {
      const pages = [];
      const total = totalPages.value;
      const current = currentPage.value;
      
      if (total <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Show smart pagination
        if (current <= 4) {
          // Show first 5 pages + ... + last page
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          if (total > 6) {
            pages.push('...');
            pages.push(total);
          }
        } else if (current >= total - 3) {
          // Show first page + ... + last 5 pages
          pages.push(1);
          if (total > 6) {
            pages.push('...');
          }
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // Show first + ... + current-1, current, current+1 + ... + last
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages;
    });

    // Log page data when component mounts
    onMounted(() => {
      if (currentPageData.value) {
        console.log('📄 Blog page data loaded:', {
          title: pageTitle.value,
          content: pageContent.value,
          keywords: pageKeywords.value,
          postsCount: currentPageData.value.posts?.length || 0,
          fullData: currentPageData.value
        });
        
        console.log('🔄 Processed blog posts:', processedBlogPosts.value);
      }
    });

    return {
      activeCategory,
      currentPage,
      categories,
      blogPosts,
      goToPost,
      // Pagination
      totalPages,
      pageNumbers,
      goToPage,
      nextPage,
      prevPage,
      filteredPosts,
      postsPerPage,
      // Expose page data for template usage
      currentPageData,
      pageTitle,
      pageContent,
      pageKeywords,
      processedBlogPosts
    };
  },
});
</script>
