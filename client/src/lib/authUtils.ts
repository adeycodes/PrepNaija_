// Enhanced authentication utilities
// File: /lib/authUtils.js
// src/lib/authUtils.ts
export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.startsWith("401") || error.message.includes("Unauthorized");
  }
  return false;
}


class AuthManager {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
    this.refreshTokenKey = 'refreshToken';
  }

  // Get token from multiple possible sources
  getToken() {
    // Try different token keys that might be used
    const possibleKeys = [
      'authToken', 'token', 'accessToken', 'jwt', 
      'access_token', 'auth_token', 'bearer_token'
    ];
    
    // Check localStorage first
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`Found token in localStorage with key: ${key}`);
        return token;
      }
    }
    
    // Check sessionStorage
    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        console.log(`Found token in sessionStorage with key: ${key}`);
        return token;
      }
    }
    
    // Check cookies as fallback
    const cookieToken = this.getTokenFromCookie();
    if (cookieToken) {
      console.log('Found token in cookies');
      return cookieToken;
    }
    
    console.log('No authentication token found');
    return null;
  }

  // Get token from cookies
  getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    const tokenCookies = ['authToken', 'token', 'jwt', 'access_token'];
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (tokenCookies.includes(name) && value) {
        return value;
      }
    }
    return null;
  }

  // Store token with persistence
  setToken(token, rememberMe = true) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    
    // Also set as cookie for better persistence
    const expires = rememberMe ? 'expires=' + new Date(Date.now() + 30*24*60*60*1000).toUTCString() : '';
    document.cookie = `authToken=${token}; ${expires}; path=/; SameSite=Lax`;
    
    console.log('Token stored successfully');
  }

  // Remove all authentication data
  clearAuth() {
    // Clear from localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.refreshTokenKey);
    
    // Clear from sessionStorage
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    
    // Clear cookies
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    console.log('Authentication data cleared');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Create authenticated fetch wrapper
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      credentials: 'include',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    console.log('Making authenticated request to:', url);
    console.log('Request headers:', config.headers);
    
    try {
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication failed, clearing stored auth data');
        this.clearAuth();
        
        // Try to refresh token if available
        const refreshToken = localStorage.getItem(this.refreshTokenKey) || 
                           sessionStorage.getItem(this.refreshTokenKey);
        
        if (refreshToken) {
          console.log('Attempting to refresh token...');
          const refreshed = await this.refreshAuthToken(refreshToken);
          if (refreshed) {
            // Retry the original request with new token
            return this.authenticatedFetch(url, options);
          }
        }
        
        // If refresh fails or no refresh token, redirect to login
        this.redirectToLogin();
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  }

  // Refresh authentication token
  async refreshAuthToken(refreshToken) {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          this.setToken(data.token, true);
          if (data.refreshToken) {
            localStorage.setItem(this.refreshTokenKey, data.refreshToken);
          }
          console.log('Token refreshed successfully');
          return true;
        }
      }
      
      console.log('Token refresh failed');
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  // Redirect to login page
  redirectToLogin() {
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    
    console.log('Redirecting to login:', loginUrl);
    
    // Give user a moment to see any error message
    setTimeout(() => {
      window.location.href = loginUrl;
    }, 2000);
  }

  // Verify authentication status with server
  async verifyAuth() {
    try {
      const response = await this.authenticatedFetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return null;
    }
  }
}

// Create singleton instance
const authManager = new AuthManager();

export default authManager;

// Export utility functions for backward compatibility
export const getAuthToken = () => authManager.getToken();
export const setAuthToken = (token, rememberMe) => authManager.setToken(token, rememberMe);
export const clearAuth = () => authManager.clearAuth();
export const isAuthenticated = () => authManager.isAuthenticated();
export const authenticatedFetch = (url, options) => authManager.authenticatedFetch(url, options);
export const verifyAuth = () => authManager.verifyAuth();