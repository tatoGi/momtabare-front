<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-8 lg:w-2/3">
      <ol class="inline-flex items-center space-x-1 text-sm">
        <li class="inline-flex items-center">
          <router-link to="/" class="text-gray-600 hover:text-[#F44000] transition-colors">მთავარი</router-link>
        </li>
        <li class="flex items-center">
          <span class="mx-2">/</span>
          <router-link to="/blog" class="text-gray-600 hover:text-[#F44000] transition-colors">ბლოგი</router-link>
        </li>
        <li class="flex items-center">
          <span class="mx-2">/</span>
          <span class="text-gray-400">{{ post?.title }}</span>
        </li>
      </ol>
    </nav>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Main Content -->
      <div class="w-full lg:w-4/3">
        <article v-if="post" class="bg-white rounded-lg">
          <!-- Post Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-4">
              <span class="blog-date">{{ formatDate(post.date) }}</span>
              <span class="blog-category">{{ getCategoryName(post.category) }}</span>
            </div>
          </div>

          <!-- Post Image -->
          <div class="mb-8 rounded-lg overflow-hidden blog-image">
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
        <div v-if="relatedPosts.length > 0" class="bg-white rounded-lg  top-4">
          <h2 class="text-xl font-bold text-gray-900 mb-6 pb-3 ">ასევე დაგაინტერესებს</h2>
          <div class="space-y-4">
            <div v-for="related in relatedPosts" :key="related.id" class="gap-4 pb-4 related-item">
              <div class="w-full">
                <img :src="related.image" :alt="related.title" class="w-full h-full object-cover rounded">
              </div>
              <div>
                <div class="text-xs text-gray-500 mt-2">{{ formatDate(related.date) }}</div>
                <h3 class="font-medium text-gray-900 line-clamp-2 mb-1">{{ related.title }}</h3>
                
                <router-link 
                  :to="{ name: 'blog-show', params: { id: related.id } }" 
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  category: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
}

const route = useRoute();
const post = ref<BlogPost | null>(null);
const relatedPosts = ref<BlogPost[]>([]);

// Mock blog data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "სიახლე 1",
    content: "სიახლის კონტენტი 1",
    date: "2025-07-15",
    category: 1,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 2,
    title: "სიახლე 2",
    content: "სიახლის კონტენტი 2",
    date: "2025-07-14",
    category: 1,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 3,
    title: "სიახლე 3",
    content: "სიახლის კონტენტი 3",
    date: "2025-07-13",
    category: 2,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  }
];

// Mock categories
const categories: Category[] = [
  { id: 1, name: "კატეგორია 1" },
  { id: 2, name: "კატეგორია 2" }
];

const getCategoryName = (categoryId: number) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'უცნობი კატეგორია';
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Load post data when component is mounted
onMounted(() => {
  if (route.query.title) {
    // Create post object from route query parameters
    post.value = {
      id: route.params.id ? Number(route.params.id) : 0,
      title: String(route.query.title || ''),
      content: String(route.query.content || ''),
      date: String(route.query.date || ''),
      category: Number(route.query.category) || 0,
      image: String(route.query.image || '')
    };
    
    // Set related posts (filter out current post)
    relatedPosts.value = blogPosts.filter(p => p.id !== post.value?.id).slice(0, 3);
  } else if (route.params.id) {
    // Fallback: If no query params, try to find post by ID from mock data
    const postId = Number(route.params.id);
    const foundPost = blogPosts.find(p => p.id === postId);
    if (foundPost) {
      post.value = foundPost;
      // Set related posts (filter out current post)
      relatedPosts.value = blogPosts.filter(p => p.id !== postId).slice(0, 3);
    }
  }
});
</script>