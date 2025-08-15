// src/app/lib/api.ts
'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private authCheckPromise: Promise<boolean> | null = null;

  private async waitForAuth(): Promise<boolean> {
    // If we're already checking auth, wait for that check to complete
    if (this.authCheckPromise) {
      return this.authCheckPromise;
    }

    this.authCheckPromise = new Promise((resolve) => {
      const checkAuth = () => {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('auth_user');
        
        if (token && user) {
          console.log('🔐 Auth state ready:', { hasToken: !!token, hasUser: !!user });
          resolve(true);
        } else {
          console.log('⏳ Waiting for auth state...', { hasToken: !!token, hasUser: !!user });
          // If no auth data, check again in a short interval
          setTimeout(checkAuth, 100);
        }
      };
      
      checkAuth();
    });

    const result = await this.authCheckPromise;
    this.authCheckPromise = null; // Reset for next use
    return result;
  }

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const subdomain = this.getSubdomain();
    
    console.log('🔧 API Headers:', { 
      hasToken: !!token, 
      subdomain, 
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none' 
    });
    
    return {
      'Content-Type': 'application/json',
      'x-subdomain': subdomain,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private getSubdomain() {
    if (typeof window === 'undefined') return 'admin';
    
    const hostname = window.location.hostname;
    
    if (hostname.includes('localhost')) {
      const path = window.location.pathname;
      if (path.includes('/admin')) return 'admin';
      return 'vmta';
    }
    
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      return ['www', 'api', 'mail', 'ftp'].includes(subdomain) ? 'admin' : subdomain;
    }
    
    return 'admin';
  }

  async request(endpoint: string, options: RequestInit = {}, requireAuth = true) {
    // Wait for authentication to be ready if required
    if (requireAuth) {
      const authReady = await this.waitForAuth();
      if (!authReady) {
        console.error('❌ Authentication not available');
        throw new Error('Authentication required');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    console.log(`📨 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('🔐 Authentication expired - clearing auth data');
        // Token expired, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenant');
        window.location.href = '/login';
        throw new Error('Authentication expired');
      }
      
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error('❌ API Error:', error);
      throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    console.log(`✅ API Success: ${endpoint}`, data);
    return data;
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // Don't require auth for login
  }

  // Companies - with enhanced logging
  async getCompanies() {
    console.log('🏢 Fetching companies...');
    try {
      const result = await this.request('/companies');
      console.log('🏢 Companies fetched successfully:', result.length);
      return result;
    } catch (error) {
      console.error('🏢 Failed to fetch companies:', error);
      throw error;
    }
  }

  async createCompany(data: any) {
    console.log('🏢 Creating company:', data.naam);
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: string, data: any) {
    console.log('🏢 Updating company:', id);
    return this.request(`/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: string) {
    console.log('🏢 Deleting company:', id);
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Branches - with enhanced logging
  async getBranches() {
    console.log('🏪 Fetching branches...');
    try {
      const result = await this.request('/branches');
      console.log('🏪 Branches fetched successfully:', result.length);
      return result;
    } catch (error) {
      console.error('🏪 Failed to fetch branches:', error);
      throw error;
    }
  }

  async createBranch(data: any) {
    console.log('🏪 Creating branch:', data.naam_vestiging);
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBranch(id: string, data: any) {
    console.log('🏪 Updating branch:', id);
    return this.request(`/branches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBranch(id: string) {
    console.log('🏪 Deleting branch:', id);
    return this.request(`/branches/${id}`, {
      method: 'DELETE',
    });
  }

  // Students
  async getStudents() {
    console.log('👥 Fetching students...');
    try {
      const result = await this.request('/students');
      console.log('👥 Students fetched successfully:', result.length);
      return result;
    } catch (error) {
      console.error('👥 Failed to fetch students:', error);
      throw error;
    }
  }

  async getStudentStats() {
    return this.request('/students/stats');
  }

  async createStudent(data: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudent(id: string, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: string) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Import methods with proper authentication
  async importStudents(file: File) {
    // Wait for auth before proceeding
    await this.waitForAuth();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    const subdomain = this.getSubdomain();
    
    const response = await fetch(`${API_BASE_URL}/import/students`, {
      method: 'POST',
      headers: {
        'x-subdomain': subdomain,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenant');
        window.location.href = '/login';
        throw new Error('Authentication expired');
      }
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async importCompanies(file: File) {
    // Wait for auth before proceeding
    await this.waitForAuth();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    const subdomain = this.getSubdomain();
    
    const response = await fetch(`${API_BASE_URL}/import/companies`, {
      method: 'POST',
      headers: {
        'x-subdomain': subdomain,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenant');
        window.location.href = '/login';
        throw new Error('Authentication expired');
      }
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Super Admin - Tenant Management
  async getTenants() {
    return this.request('/tenants');
  }

  async createTenant(data: any) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTenant(id: string, data: any) {
    return this.request(`/tenants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(id: string) {
    return this.request(`/tenants/${id}`, {
      method: 'DELETE',
    });
  }

  async getTenantUsers(tenantId: string) {
    return this.request(`/tenants/${tenantId}/users`);
  }

  async createTenantAdmin(tenantId: string, userData: any) {
    return this.request(`/tenants/${tenantId}/admins`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getTenantStats(tenantId?: string) {
    const endpoint = tenantId ? `/tenants/${tenantId}/stats` : '/tenants/stats';
    return this.request(endpoint);
  }

  async resetUserPassword(userId: string, newPassword: string) {
    return this.request(`/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password: newPassword }),
    });
  }

  async getSystemStats() {
    return this.request('/admin/stats');
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    return !!(token && user);
  }

  // Utility method to get current auth state
  getAuthState() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    const tenant = localStorage.getItem('auth_tenant');
    
    return {
      isAuthenticated: !!(token && user),
      hasToken: !!token,
      hasUser: !!user,
      hasTenant: !!tenant,
      user: user ? JSON.parse(user) : null,
      tenant: tenant ? JSON.parse(tenant) : null
    };
  }
}

export const apiService = new ApiService();