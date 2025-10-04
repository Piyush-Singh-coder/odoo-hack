import { create } from 'zustand';
import { api } from './authStore.js';

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/users');
      set({ users: response.data.users, loading: false });
      return { success: true, data: response.data.users };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch users';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/users', userData);
      await get().fetchUsers(); // Refresh users list
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create user';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/users/${userId}`, userData);
      await get().fetchUsers(); // Refresh users list
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update user';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/users/${userId}`);
      await get().fetchUsers(); // Refresh users list
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete user';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearError: () => set({ error: null }),
}));
