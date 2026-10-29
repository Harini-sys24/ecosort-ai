// EcoSort AI - Centralized API Client

const API_BASE = '/api';

function getAuthHeaders(isMultipart = false) {
  const token = localStorage.getItem('ecosort_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) || (data && data.message) || response.statusText || 'An unexpected error occurred';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Auth Endpoints
  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Content Endpoints
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  async getCategory(slug) {
    const res = await fetch(`${API_BASE}/categories/${slug}`);
    return handleResponse(res);
  },

  async getGuidance(slug) {
    const res = await fetch(`${API_BASE}/guidance/${slug}`);
    return handleResponse(res);
  },

  async getCentres(params = {}) {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.city) query.set('city', params.city);
    if (params.pin) query.set('pin', params.pin);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    const res = await fetch(`${API_BASE}/centres${queryString}`);
    return handleResponse(res);
  },

  // Classification Endpoints
  async classifyItem(formData) {
    const res = await fetch(`${API_BASE}/classify`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async getUserHistory() {
    const res = await fetch(`${API_BASE}/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async saveToHistory(historyData) {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(historyData),
    });
    return handleResponse(res);
  },

  async deleteHistoryItem(id) {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Endpoints
  async getAdminOverview() {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async addCategory(categoryData) {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  async updateCategory(id, categoryData) {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    return handleResponse(res);
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateGuidance(slug, guidanceData) {
    const res = await fetch(`${API_BASE}/admin/guidance/${slug}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(guidanceData),
    });
    return handleResponse(res);
  },

  async addCentre(centreData) {
    const res = await fetch(`${API_BASE}/admin/centres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(centreData),
    });
    return handleResponse(res);
  },

  async updateCentre(id, centreData) {
    const res = await fetch(`${API_BASE}/admin/centres/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(centreData),
    });
    return handleResponse(res);
  },

  async deleteCentre(id) {
    const res = await fetch(`${API_BASE}/admin/centres/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/admin/model-metrics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
