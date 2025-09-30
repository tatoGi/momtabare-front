<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center">
        <button 
          @click="$router.go(-1)" 
          class="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex items-center">
          <img 
            :src="getUserAvatar(recipient)" 
            :alt="recipient.name"
            class="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <div class="flex items-center">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mr-2">{{ recipient.name }}</h2>
              <span 
                class="w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800"
                :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
                :title="isOnline ? 'Online' : 'Offline'"
              ></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ isCurrentUser ? 'Online' : (isOnline ? 'აქტიურია ახლა' : lastSeen || 'არააქტიური') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
      @scroll="handleScroll"
    >
      <div v-if="isLoading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F44000]"></div>
      </div>
      
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center h-full">
        <p class="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
      </div>
      
      <template v-else>
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="[
            'flex',
            message.sender_id === userStore.user?.id ? 'justify-end' : 'justify-start'
          ]"
        >
          <div 
            :class="[
              'max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2',
              message.sender_id === userStore.user?.id 
                ? 'bg-[#F44000] text-white rounded-tr-none' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
            ]"
          >
            <p class="break-words">{{ message.message }}</p>
            <p 
              class="text-xs mt-1 text-right"
              :class="message.sender_id === userStore.user?.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'"
            >
              {{ formatTime(message.created_at) }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Message Input -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <form @submit.prevent="sendMessage" class="flex items-center">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F44000]/50 focus:border-transparent dark:bg-gray-700 dark:text-white"
          :disabled="isSending"
        />
        <button
          type="submit"
          class="bg-[#F44000] text-white px-4 py-2 rounded-r-lg hover:bg-[#E53900] focus:outline-none focus:ring-2 focus:ring-[#F44000]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newMessage.trim() || isSending"
        >
          <span v-if="isSending" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
          <span v-else>Send</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/pinia/user.pinia';
import { useChatStore, type IMessage } from '@/pinia/chat.pinia';
import { getAssetUrl } from '@/utils/config/env';
// Pusher will be loaded via CDN
// @ts-ignore - Pusher is available globally when loaded via CDN
declare const Pusher: any;

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();

const recipientId = ref<number>(parseInt(route.params.userId as string, 10));
const recipient = ref<any>({});
const messages = ref<IMessage[]>([]);
const newMessage = ref('');
const isSending = ref(false);
const isLoading = ref(true);
const isOnline = ref(false);
const lastSeen = ref<string | null>(null);
const isCurrentUser = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// Fetch recipient data
const fetchRecipient = async () => {
  try {
    const token = localStorage.getItem('auth_token') || '';
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${recipientId.value}?include=last_seen`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipient data');
    }
    
    if (response.ok) {
      const data = await response.json();
      recipient.value = data.data;
      
      // Set initial last seen status and check if it's the current user
      isCurrentUser.value = data.data.id === userStore.user?.id;
      if (data.data.last_seen) {
        lastSeen.value = isCurrentUser.value ? 'Online' : `ბოლოს ნანახი ${formatLastSeen(data.data.last_seen)}`;
      }
    }
  } catch (error) {
    console.error('Error fetching recipient:', error);
  }
};

// Fetch messages
const fetchMessages = async () => {
  try {
    isLoading.value = true;
    await chatStore.fetchMessages(recipientId.value);
    messages.value = [...chatStore.messages];
    
    // Mark messages as read
    messages.value
      .filter(msg => msg.receiver_id === userStore.user?.id && !msg.read_at)
      .forEach(msg => chatStore.markAsRead(msg.id));
      
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    isLoading.value = false;
  }
};

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  try {
    isSending.value = true;
    await chatStore.sendMessage(recipientId.value, newMessage.value.trim());
    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    isSending.value = false;
  }
};

// Scroll to bottom of messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Handle scroll for infinite loading
const handleScroll = () => {
  if (!messagesContainer.value || isLoading.value) return;
  
  const { scrollTop } = messagesContainer.value;
  if (scrollTop < 100) {
    // Load more messages when near top
    // Implement infinite scroll if needed
  }
};

// Format time
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format last seen time
const formatLastSeen = (dateString: string) => {
  const now = new Date();
  const lastSeen = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'ახლა';
  if (diffInMinutes < 60) return `${diffInMinutes} წუთის წინ`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} საათის წინ`;
  return `${Math.floor(diffInMinutes / 1440)} დღის წინ`;
};

// Get user avatar URL
const getUserAvatar = (user: any) => {
  if (user?.avatar) {
    return getAssetUrl(user.avatar);
  }
  return '/img/avatar-placeholder.png';
};

// Initialize Pusher for real-time updates
let channel: any = null;

const initializePusher = () => {
  const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: `${import.meta.env.VITE_BACKEND_URL}/broadcasting/auth`,
    auth: {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'Accept': 'application/json',
      },
    },
  });

  // Subscribe to private channel for this conversation
  channel = pusher.subscribe(`private-chat.${[userStore.user?.id, recipientId.value].sort().join('-')}`);
  
  // Listen for new messages
  channel.bind('MessageSent', (data: any) => {
    if (data.message) {
      messages.value.push(data.message);
      
      // If the message is for the current user, mark it as read
      if (data.message.receiver_id === userStore.user?.id) {
        chatStore.markAsRead(data.message.id);
      }
      
      scrollToBottom();
    }
  });
  
  // Listen for message read events
  channel.bind('MessageRead', (data: any) => {
    const message = messages.value.find(m => m.id === data.messageId);
    if (message) {
      message.read_at = data.readAt;
    }
  });
  
  // Listen for typing indicators
  channel.bind('UserTyping', (data: any) => {
    // Handle typing indicator if needed
    console.log('User is typing:', data);
  });
  
  // Listen for user online/offline status
  channel.bind('UserOnline', (data: any) => {
    if (data.userId === recipientId.value) {
      isOnline.value = true;
      lastSeen.value = 'ახლა არის ონლაინ';
    }
  });
  
  channel.bind('UserOffline', (data: any) => {
    if (data.userId === recipientId.value) {
      isOnline.value = false;
      lastSeen.value = data.lastSeen ? `ბოლოს ნანახი ${formatLastSeen(data.lastSeen)}` : 'არააქტიური';
    }
  });
  
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
};

// Lifecycle hooks
onMounted(async () => {
  if (!userStore.authenticated) {
    router.push({ name: 'login' });
    return;
  }
  
  await Promise.all([fetchRecipient(), fetchMessages()]);
  
  // Initialize Pusher for real-time updates
  if (import.meta.env.VITE_PUSHER_APP_KEY) {
    initializePusher();
  }
  
  // Mark all messages as read when component mounts
  messages.value
    .filter(msg => msg.receiver_id === userStore.user?.id && !msg.read_at)
    .forEach(msg => chatStore.markAsRead(msg.id));
});

// Clean up on unmount
onUnmounted(() => {
  if (channel) {
    channel.unbind_all();
    channel.unsubscribe();
  }
  chatStore.clearMessages();
});

// Watch for route changes
watch(
  () => route.params.userId,
  async (newUserId: string) => {
    if (newUserId) {
      recipientId.value = parseInt(newUserId, 10);
      await Promise.all([fetchRecipient(), fetchMessages()]);
      
      // Reinitialize Pusher for new conversation
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      
      if (import.meta.env.VITE_PUSHER_APP_KEY) {
        initializePusher();
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
