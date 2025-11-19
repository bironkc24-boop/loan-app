import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

export const api = {
  async get(endpoint: string) {
    console.log('DEBUG: API - GET request to:', endpoint);
    const headers = await getAuthHeaders();
    console.log('DEBUG: API - Headers:', headers);
    const response = await fetch(`${API_URL}${endpoint}`, { headers });
    console.log('DEBUG: API - GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: API - GET error response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DEBUG: API - GET success data:', data);
    return data;
  },

  async post(endpoint: string, data: any) {
    console.log('DEBUG: API - POST request to:', endpoint, 'with data:', data);
    const headers = await getAuthHeaders();
    console.log('DEBUG: API - Headers:', headers);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    console.log('DEBUG: API - POST response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('DEBUG: API - POST error response:', error);
      throw new Error(error.error || 'Request failed');
    }

    const responseData = await response.json();
    console.log('DEBUG: API - POST success data:', responseData);
    return responseData;
  },

  async put(endpoint: string, data: any) {
    console.log('DEBUG: API - PUT request to:', endpoint, 'with data:', data);
    const headers = await getAuthHeaders();
    console.log('DEBUG: API - Headers:', headers);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    console.log('DEBUG: API - PUT response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: API - PUT error response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('DEBUG: API - PUT success data:', responseData);
    return responseData;
  },

  async delete(endpoint: string) {
    console.log('DEBUG: API - DELETE request to:', endpoint);
    const headers = await getAuthHeaders();
    console.log('DEBUG: API - Headers:', headers);
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    console.log('DEBUG: API - DELETE response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: API - DELETE error response:', errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DEBUG: API - DELETE success data:', data);
    return data;
  },
};

export default api;
