<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <router-link to="/" class="inline-flex items-center text-gray-700 hover:text-blue-600">
            <svg class="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            მთავარი
          </router-link>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <router-link to="/blog" class="ml-1 text-gray-700 hover:text-blue-600 md:ml-2">ბლოგი</router-link>
          </div>
        </li>
        <li>
          <div class="flex items-center">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="ml-1 text-gray-400 md:ml-2">{{ post?.title }}</span>
          </div>
        </li>
      </ol>
    </nav>

    <!-- Post Content -->
    <article v-if="post" class="prose prose-lg max-w-none">
      <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
      <div class="flex items-center mb-6">
        <span class="text-gray-600 mr-4">{{ new Date(post.date).toLocaleDateString() }}</span>
        <span class="text-gray-600">კატეგორია: {{ getCategoryName(post.category) }}</span>
      </div>
      <div class="mb-6">
        <div v-html="post.content"></div>
      </div>
    </article>

    <!-- Related Posts -->
    <div v-if="relatedPosts.length > 0" class="mt-8">
      <h2 class="text-2xl font-bold mb-4">დამახსოვრებული სიახლეები</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="related in relatedPosts" :key="related.id" class="bg-white rounded-lg shadow">
          <img :src="related.image" :alt="related.title" class="w-full h-48 object-cover rounded-t-lg">
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2">{{ related.title }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">კატეგორიები</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="category in categories" :key="category.id" class="bg-white rounded-lg shadow p-4">
          <h3 class="text-lg font-semibold mb-2">{{ category.name }}</h3>
          <p class="text-gray-600">{{ category.count }} სიახლე</p>
        </div>
      </div>
    </div>

    <!-- Post Content -->
    <div v-if="post && post.image" class="text-center py-12">
      <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
      <div class="flex items-center mb-6">
        <span class="text-gray-600 mr-4">{{ new Date(post.createdAt).toLocaleDateString() }}</span>
        <span class="text-gray-600">კატეგორია: {{ getCategoryName(post.category) }}</span>
      </div>
      <div class="mb-6">
        <div v-html="post.content"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="!post" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F44000] mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">იტვირთება...</p>
    </div>

    <!-- No Post Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">პოსტი ვერ მოიძებნა</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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

export default defineComponent({
  name: 'BlogShow',
  setup() {
    const route = useRoute();
    const postId = parseInt(route.params.id as string);
    
    // Mock blog data - replace with actual data from your API
    const blogPosts: BlogPost[] = [
      {
        id: 1,
        title: "სიახლე 1",
        content: "სიახლის კონტენტი",
        date: "2025-07-15",
        category: 1,
        image: '/path/to/blogitem.png'
      },
      {
        id: 2,
        title: "სიახლე 2",
        content: "სიახლის კონტენტი",
        date: "2025-07-14",
        category: 1,
        image: '/path/to/blogitem.png'
      },
      {
        id: 3,
        title: "სიახლე 3",
        content: "სიახლის კონტენტი",
        date: "2025-07-13",
        category: 2,
        image: '/path/to/blogitem.png'
      },
      {
        id: 4,
        title: "სიახლე 4",
        content: "სიახლის კონტენტი",
        date: "2025-07-12",
        category: 2,
        image: '/path/to/blogitem.png'
      }
    ];

    // Mock categories
    const categories: Category[] = [
      { id: 1, name: "კატეგორია 1" },
      { id: 2, name: "კატეგორია 2" }
    ];

    const post = ref<BlogPost | null>(blogPosts.find(p => p.id === postId) || null);
    const relatedPosts = ref<BlogPost[]>(blogPosts.filter(p => p.category === post.value?.category && p.id !== postId));

    const getCategoryName = (categoryId: number) => {
      const category = categories.find(c => c.id === categoryId);
      return category?.name || 'უცნობი კატეგორია';
    };

    return {
      post,
      relatedPosts,
      categories,
      getCategoryName
    };
  }
});
</script>