import { create } from 'zustand';
import { api } from './authStore';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  myExpenses: [],
  pendingApprovals: [],
  allExpenses: [],
  loading: false,
  error: null,
  ocrData: null,

  // Employee - Create expense
  createExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      Object.keys(expenseData).forEach((key) => {
        if (expenseData[key] !== null && expenseData[key] !== undefined) {
          formData.append(key, expenseData[key]);
        }
      });

      const response = await api.post('/expenses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh my expenses after creating
      await get().fetchMyExpenses();
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create expense';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // OCR - Scan receipt
  scanReceipt: async (receiptFile) => {
    set({ loading: true, error: null, ocrData: null });
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const response = await api.post('/expenses/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set({ 
        ocrData: response.data.extractedData, 
        loading: false 
      });
      return { success: true, data: response.data.extractedData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to scan receipt';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearOcrData: () => set({ ocrData: null }),

  // Employee - Get my expenses
  fetchMyExpenses: async (status = null) => {
    set({ loading: true, error: null });
    try {
      const url = status 
        ? `/expenses/my-expenses?status=${status}` 
        : '/expenses/my-expenses';
      const response = await api.get(url);
      set({ myExpenses: response.data.expenses, loading: false });
      return { success: true, data: response.data.expenses };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch expenses';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Manager - Get pending approvals
  fetchPendingApprovals: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/expenses/pending-approvals');
      set({ pendingApprovals: response.data.approvals, loading: false });
      return { success: true, data: response.data.approvals };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch pending approvals';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Manager - Approve or reject expense
  approveOrRejectExpense: async (expenseId, action, comments) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/expenses/${expenseId}/approve-reject`, {
        action,
        comments,
      });
      
      // Refresh pending approvals after action
      await get().fetchPendingApprovals();
      set({ loading: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to process approval';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Admin - Get all expenses
  fetchAllExpenses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      
      const url = params.toString() 
        ? `/expenses/all?${params.toString()}` 
        : '/expenses/all';
      
      const response = await api.get(url);
      set({ allExpenses: response.data.expenses, loading: false });
      return { success: true, data: response.data.expenses };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to fetch all expenses';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  clearError: () => set({ error: null }),
}));
