import axios from 'axios';

const API_BASE_URL = 'http://172.20.228.2:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const leavesService = {
  // Get all leaves with optional filters
  getAllLeaves: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.employee_id) params.append('employee_id', filters.employee_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.year) params.append('year', filters.year);
      if (filters.skip) params.append('skip', filters.skip);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/leaves/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leaves:', error);
      throw error;
    }
  },

  // Get leave by ID
  getLeaveById: async (leaveId) => {
    try {
      const response = await api.get(`/leaves/${leaveId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave:', error);
      throw error;
    }
  },

  // Get leaves by employee ID
  getLeavesByEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/leaves/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee leaves:', error);
      throw error;
    }
  },

  // Create new leave
  createLeave: async (leaveData) => {
    try {
      const response = await api.post('/leaves/', leaveData);
      return response.data;
    } catch (error) {
      console.error('Error creating leave:', error);
      throw error;
    }
  },

  // Update leave
  updateLeave: async (leaveId, leaveData) => {
    try {
      const response = await api.put(`/leaves/${leaveId}`, leaveData);
      return response.data;
    } catch (error) {
      console.error('Error updating leave:', error);
      throw error;
    }
  },

  // Delete leave
  deleteLeave: async (leaveId) => {
    try {
      const response = await api.delete(`/leaves/${leaveId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting leave:', error);
      throw error;
    }
  },

  // Get leave statistics
  getLeaveStats: async (employeeId, year = null) => {
    try {
      const url = year 
        ? `/leaves/stats/${employeeId}?year=${year}`
        : `/leaves/stats/${employeeId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave stats:', error);
      throw error;
    }
  },
};