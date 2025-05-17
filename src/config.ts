/**
 * Central configuration file for the application
 * Contains environment variables and other configuration settings
 */

// API configuration
export const API_CONFIG = {
  // Use environment variable with fallback to localhost
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.shopmaraph.com/api',
};

// Export other configurations as needed
export default {
  API: API_CONFIG,
}; 