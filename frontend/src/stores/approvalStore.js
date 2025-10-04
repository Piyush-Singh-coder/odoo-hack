import { create } from 'zustand';
import { api } from './authStore';

export const useApprovalStore = create((set, get) => ({
  approvalRules: [],
  loading: false,
  error: null,

  fetchApprovalRules: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/approvals/rules');
      set({ approvalRules: response.data.rules, loading: false });
      return { success: true, data: response.data.rules };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch approval rules';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  createApprovalRule: async (ruleData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/approvals/rules', ruleData);
      await get().fetchApprovalRules(); // Refresh rules list
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create approval rule';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  updateApprovalRule: async (ruleId, ruleData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/approvals/rules/${ruleId}`, ruleData);
      await get().fetchApprovalRules(); // Refresh rules list
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update approval rule';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearError: () => set({ error: null }),
}));