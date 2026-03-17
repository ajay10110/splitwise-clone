import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});


// Add a request interceptor to attach the JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

export const getFriends = () => API.get('/friends');
export const addFriend = (data) => API.post('/friends', data);
export const deleteFriend = (id) => API.delete(`/friends/${id}`);

export const getExpenses = (tripId) => API.get(`/expenses${tripId ? `?tripId=${tripId}` : ''}`);
export const addExpense = (data) => API.post('/expenses', data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const settleUp = (data) => API.post('/expenses/settle', data);

export const getBalances = (tripId) => API.get(`/balances${tripId ? `?tripId=${tripId}` : ''}`);

export const getTrips = () => API.get('/trips');
export const addTrip = (data) => API.post('/trips', data);
export const addTripMembers = (tripId, data) => API.post(`/trips/${tripId}/members`, data);
export const removeTripMember = (tripId, memberId) => API.delete(`/trips/${tripId}/members/${memberId}`);
export const deleteTrip = (tripId) => API.delete(`/trips/${tripId}`);

export default API;
