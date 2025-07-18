<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="flex mb-6" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a href="/" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-400 dark:hover:text-white">
            <svg class="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L4 11.414V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a3 3 0 0 1 6 0v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            მთავარი
          </a>
        </li>
        <li aria-current="page">
          <div class="flex items-center">
          /
            <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">ბლოგი</span>
          </div>
        </li>
      </ol>
    </nav>

    <div class="flex flex-col md:flex-row gap-8">
      <!-- Sidebar -->
      <div class="w-full md:w-1/4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
          <h2 class="text-xl font-bold mb-4 dark:text-white">კატეგორიები</h2>
          <ul class="space-y-2">
            <li v-for="category in categories" :key="category.id" 
                class="flex justify-between items-center py-2 px-3 rounded-lg cursor-pointer transition-colors group"
                :class="{'hover:bg-gray-50 dark:hover:bg-gray-700': activeCategory !== category.id}"
                @click="activeCategory = category.id">
              <span class="text-sm transition-colors"
                    :class="activeCategory === category.id 
                      ? 'text-[#F44000]' 
                      : 'group-hover:text-[#F44000]'">{{ category.name }}</span>
              <span class="text-xs rounded-full px-2 py-1 transition-colors" 
                    :class="activeCategory === category.id 
                      ? 'bg-gray-100 dark:bg-gray-700 text-[#F44000]' 
                      : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-[#F44000] group-hover:text-white'">{{ category.count }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Blog Posts -->
      <div class="w-full md:w-3/4">
        <div class="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <div 
            v-for="post in blogPosts" 
            :key="post.id"
            class="block cursor-pointer"
            @click="goToPost(post)"
          >
            <BlogItem :post="post" />
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-1">
            <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <button v-for="page in 6" :key="page" 
                    class="w-10 h-10 flex items-center justify-center rounded-full"
                    :class="{'bg-orange-500 text-white': currentPage === page, 
                           'hover:bg-gray-100 dark:hover:bg-gray-700': currentPage !== page}">
              {{ page }}
            </button>
            
            <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
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
