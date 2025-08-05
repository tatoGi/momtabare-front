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
        <div class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-1">
            <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <button v-for="page in 6" :key="page" class="w-10 h-10 flex items-center justify-center rounded-full"
              :class="{
                'bg-orange-500 text-white': currentPage === page,
                'hover:bg-gray-100 dark:hover:bg-gray-700': currentPage !== page
              }">
              {{ page }}
            </button>

            <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import BlogItem from '@/components/blog/BlogItem.vue';
import blogImage from '@/assets/img/blogItem.png';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string | number;
  image: string;
}

export default defineComponent({
  name: 'BlogView',
  components: {
    BlogItem
  },
  setup() {
    const router = useRouter();
    const activeCategory = ref('all');
    const currentPage = ref(1);

    const goToPost = (post: BlogPost) => {
      router.push({
        name: 'blog-show',
        params: { id: post.id },
        query: {
          title: post.title,
          content: post.content,
          date: post.date,
          category: String(Number(post.category) || 0), // Ensure category is a number string
          image: post.image
        }
      });
    };

    const categories = [
      { id: 'all', name: 'ყველა სიახლე', count: 254 },
      { id: 'hiking', name: 'ლაშქრობა', count: 40 },
      { id: 'places', name: 'საინტერესო ადგილები', count: 66 },
      { id: 'culinary', name: 'კულინარია', count: 2 },
      { id: 'infographics', name: 'ინფოგრაფია', count: 7 },
      { id: 'shopping', name: 'შოპინგი', count: 9 },
      { id: 'tours', name: 'ვირტუალური ტურები', count: 4 },
      { id: 'culture', name: 'კულტურა', count: 17 },
      { id: 'history', name: 'ისტორია', count: 40 },
      { id: 'sports', name: 'ექსტრემალური სპორტი', count: 29 },
    ];

    // Mock blog posts data - in a real app, this would come from an API
    const blogPosts: BlogPost[] = [
      {
        id: 1,
        title: 'სათხილამურო კურორტები საქართველოში',
        date: '2025-07-15',
        image: blogImage,
        category: 'sports',
        content: 'სათხილამურო კურორტების შესახებ სრული ინფორმაცია...'
      },
      {
        id: 2,
        title: 'ულამაზესი ბუნებრივი ტბები საქართველოში',
        date: '2025-07-14',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'places',
        content: 'საქართველოს ყველაზე ლამაზი ტბების შესახებ სრული ინფორმაცია...'
      },
      {
        id: 3,
        title: 'ისტორიული ღირსშესანიშნაობები საქართველოში',
        date: '2025-07-13',
        image: 'https://images.unsplash.com/photo-1582972236019-e413f40cbfc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'history',
        content: 'საქართველოს ისტორიული ღირსშესანიშნაობების შესახებ სრული ინფორმაცია...'
      },
      {
        id: 4,
        title: 'საუკეთესო რესტორნები თბილისში',
        date: '2025-07-12',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'food',
        content: 'თბილისის საუკეთესო რესტორნების შესახებ სრული ინფორმაცია...'
      },
      {
        id: 5,
        title: 'პიკნიკისთვის იდეალური ადგილები',
        date: '2025-07-11',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'places',
        content: 'პიკნიკისთვის იდეალური ადგილების შესახებ სრული ინფორმაცია...'
      },
      {
        id: 6,
        title: 'ზაფხულის არდადეგები საქართველოში',
        date: '2025-07-10',
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        category: 'places',
        content: 'ზაფხულის არდადეგებისთვის რეკომენდებული ადგილების შესახებ სრული ინფორმაცია...'
      }
    ];

    return {
      activeCategory,
      currentPage,
      categories,
      blogPosts,
      goToPost
    };
  },
});
</script>
