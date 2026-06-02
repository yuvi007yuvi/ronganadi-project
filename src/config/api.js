export const getApiBaseUrl = () => {
  // Since you don't have XAMPP/WAMP, always use the live Hostinger API 
  // even when testing the React frontend on your local computer.
  return 'https://ranganadibeta.com/api';
};

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('ronganadi_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  } else if (config.body instanceof FormData) {
    // Let the browser set the Content-Type with the correct boundary
    delete config.headers['Content-Type'];
  }

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data && data.error) || 'API Request Failed');
  }

  if (data && data.success && data.data !== undefined) {
    return data.data;
  }

  return data;
}
