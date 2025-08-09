<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-8 lg:w-2/3">
      <ol class="inline-flex items-center space-x-1 text-sm">
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
        <li class="flex items-center">
          <span class="mx-2">/</span>
          <router-link to="/blog" class="text-gray-600 hover:text-[#F44000] transition-colors">ბლოგი</router-link>
        </li>
        <li class="flex items-center">
          <span class="mx-2">/</span>
          <span class="text-gray-400 blog-post-breadcrumb-title">{{ post?.title }}</span>
        </li>
      </ol>
    </nav>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="w-full lg:w-4/3">
        <article v-if="post" class="bg-white rounded-lg">
          <!-- Post Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-4 blog-post-title">{{ post.title }}</h1>
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-4">
              <span class="blog-date">{{ formatDate(post.date) }}</span>
              <span class="blog-category">{{ getCategoryName(post.category) }}</span>
            </div>
          </div>

          <!-- Post Image -->
          <!-- Mobile: Full width image breaking out of container -->
          <div class="md:hidden mb-8 -mx-4">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full h-auto object-cover"
            >
          </div>
          
          <!-- Desktop: Contained image with border radius -->
          <div class="hidden md:block mb-8 rounded-lg overflow-hidden blog-image">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full h-auto object-cover rounded-lg"
            >
          </div>

          <!-- Post Content -->
          <div class="prose max-w-none text-gray-700">
            <div v-html="post.content"></div>
          </div>

          <!-- Post Footer -->
          <div class="mt-8 pt-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <!-- Share Buttons -->
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-gray-700">გააზიარე:</span>
                <a href="#" class="text-gray-500 hover:text-[#F44000] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-500 hover:text-[#F44000] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" class="text-gray-500 hover:text-[#F44000] transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </article>

        <!-- Loading State -->
        <div v-else class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600">იტვირთება...</p>
        </div>

        <!-- No Post Found -->
        <div v-else class="text-center py-12">
          <p class="text-gray-600 dark:text-gray-400">პოსტი ვერ მოიძებნა</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="w-full lg:w-1/3">
        <!-- Related Posts -->
        <div v-if="relatedPosts.length > 0" class="bg-white rounded-lg top-4">
          <h2 class="text-xl font-bold text-gray-900 mb-6 pb-3">ასევე დაგაინტერესებს</h2>
          
          <!-- Mobile: Horizontal Slider -->
          <div class="lg:hidden">
            <div class="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
              <div 
                v-for="related in relatedPosts" 
                :key="related.id" 
                class="flex-shrink-0 cursor-pointer"
                style="width: 255px; height: 270px; gap: 12px;"
                @click="$router.push({ name: 'blog-show', params: { id: related.id } })"
              >
                <div class="flex flex-col" style="gap: 12px;">
                  <div class="overflow-hidden" style="width: 255px; height: 204px; border-radius: 12px; opacity: 1;">
                    <img 
                      :src="related.image" 
                      :alt="related.title" 
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div class="flex flex-col" style="gap: 4px;">
                    <div class="text-xs text-gray-500">{{ formatDate(related.date) }}</div>
                    <h3 class="font-medium text-gray-900 line-clamp-2 text-sm">{{ related.title }}</h3>
                    <span class="text-xs font-medium text-[#F44000] hover:underline">
                      ვრცლად
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Desktop: Vertical List -->
          <div class="hidden lg:block space-y-4">
            <div v-for="related in relatedPosts" :key="related.id" class="gap-4 pb-4 related-item">
              <div class="w-full">
                <img :src="related.image" :alt="related.title" class="w-full h-full object-cover rounded">
              </div>
              <div>
                <div class="text-xs text-gray-500 mt-2">{{ formatDate(related.date) }}</div>
                <h3 class="font-medium text-gray-900 line-clamp-2 mb-1">{{ related.title }}</h3>
                
                <router-link 
                  :to="{ name: 'blog-show', params: { slug: related.slug } }" 
                  class="text-xs font-medium text-[#F44000] hover:underline mt-1 inline-block"
                >
                  ვრცლად
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePageData } from '@/composables/usePageData';
import { useAppStore } from '@/pinia/app.pinia';
import { getAssetUrl } from '@/utils/config/env';
import blogImage from '@/assets/img/blogItem.png';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  image: string;
  slug: string;
  author?: string;
  meta_title?: string;
  meta_description?: string;
}

const route = useRoute();
const appStore = useAppStore();
const { currentPageData } = usePageData();
const post = ref<BlogPost | null>(null);
const relatedPosts = ref<BlogPost[]>([]);

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

// Process a single blog post from backend data
const processPost = (post: any) => {
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
};

const getCategoryName = (categorySlug: string) => {
  // You can implement category name mapping here if needed
  return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ka-GE', options);
};

// Load post data when component is mounted
onMounted(() => {
  const slug = route.params.slug as string;
  
  if (currentPageData.value?.posts) {
    // Find the post by slug from backend data
    const foundPost = currentPageData.value.posts.find((p: any) => {
      const locale = currentLocale.value;
      const postSlug = getPostAttribute(p, 'slug', locale) || getPostAttribute(p, 'slug', 'en');
      return postSlug === slug;
    });
    
    if (foundPost) {
      post.value = processPost(foundPost);
      
      // Get current post's category
      const currentPostCategory = foundPost.category?.slug || 'general';
      
      // Set related posts (filter by same category, exclude current post, take first 3)
      const allProcessedPosts = currentPageData.value.posts
        .filter((p: any) => {
          // Exclude current post
          if (p.id === foundPost.id) return false;
          
          // Only include posts with same category
          const postCategory = p.category?.slug || 'general';
          return postCategory === currentPostCategory;
        })
        .map(processPost)
        .slice(0, 3);
      
      relatedPosts.value = allProcessedPosts;
      
      // If no posts in same category, fallback to any other posts (excluding current)
      if (relatedPosts.value.length === 0) {
        const fallbackPosts = currentPageData.value.posts
          .filter((p: any) => p.id !== foundPost.id)
          .map(processPost)
          .slice(0, 3);
        
        relatedPosts.value = fallbackPosts;
      }
    } else {
      console.error('Post not found with slug:', slug);
    }
  } else {
    console.error('No posts data available in currentPageData');
  }
});
</script>