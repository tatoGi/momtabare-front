import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from './user.pinia';
import { ENV } from '@/utils/config/env';
import axios from 'axios';

export interface IMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore();
  const messages = ref<IMessage[]>([]);
  const activeConversation = ref<number | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchMessages = async (userId: number) => {
    try {
      isLoading.value = true;
      const token = localStorage.getItem('auth_token') || '';
      const response = await axios.get(`${ENV.BACKEND_URL}/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      messages.value = response.data.data || [];
      activeConversation.value = userId;
      return response.data.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch messages';
      throw error.value;
    } finally {
      isLoading.value = false;
    }
  };

  const sendMessage = async (receiverId: number, message: string) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await axios.post(
        `${ENV.BACKEND_URL}/api/messages/${receiverId}`,
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.data) {
        messages.value.push(response.data.data);
      }
      
      return response.data.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to send message';
      throw error.value;
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      await axios.post(
        `${ENV.BACKEND_URL}/api/messages/${messageId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );
      
      const message = messages.value.find(m => m.id === messageId);
      if (message) {
        message.read_at = new Date().toISOString();
      }
    } catch (err) {
      console.error('Failed to mark message as read', err);
    }
  };

  const clearMessages = () => {
    messages.value = [];
    activeConversation.value = null;
  };

  return {
    messages,
    activeConversation,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    clearMessages,
  };
});
