import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.BASE_URL;

/**
 * Saves a product (creates a new one or updates an existing one)
 * @param productId Optional - if provided, updates an existing product, otherwise creates a new one
 * @param formData The form data containing product information
 * @param token Authentication token
 */
export const saveProduct = async (formData: FormData, token: string, productId?: string | number): Promise<any> => {
  try {
    // Get CSRF token first
    try {
      await fetch(`${API_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (csrfError) {
      console.error('Failed to fetch CSRF token:', csrfError);
      // Continue anyway
    }
    
    // Only use method spoofing for update operations
    if (productId) {
      formData.append('_method', 'PUT');
    }
    
    // Determine API URL based on operation type
    const apiUrl = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
    
    console.log(`Sending product ${productId ? 'update' : 'create'} request to:`, apiUrl);
    console.log('Using POST method for browser compatibility with FormData');
    
    // Debug output: Show all form data contents
    console.log('Form data contents:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}: File (${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`- ${key}: ${value}`);
      }
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('API Error Response (raw):', responseText);
      console.error('Status:', response.status, response.statusText);
      console.error('Headers:', Object.fromEntries([...response.headers.entries()]));
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('API Error Response (parsed):', errorData);
        
        // Handle authentication errors
        if (response.status === 401) {
          throw new Error('Authentication error: Your session has expired. Please log in again.');
        }
        
        // Handle method not allowed errors
        if (response.status === 405) {
          throw new Error(`Method not allowed: The server doesn't accept this request at this endpoint. Status: ${response.status} ${response.statusText}`);
        }
        
        // Handle validation errors
        if (response.status === 422 && errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || `Failed to ${productId ? 'update' : 'create'} product: ${response.status} ${response.statusText}`);
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          // JSON parse error
          console.error('Error parsing JSON response:', parseError);
          throw new Error(`Failed to ${productId ? 'update' : 'create'} product (invalid JSON response): ${response.status} ${response.statusText}\n${responseText}`);
        } else {
          // Re-throw other errors
          throw parseError;
        }
      }
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error ${productId ? 'updating' : 'creating'} product:`, error);
    throw error;
  }
};

/**
 * Deletes a product with the given ID
 */
export const deleteProduct = async (productId: string | number, token: string): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}; 