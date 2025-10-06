// Custom fetch utility with retry logic and error handling
export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Fetch attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log(`✅ Fetch successful for ${url}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Fetch attempt ${attempt + 1} failed for ${url}:`, error);
      
      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All fetch attempts failed');
}

// Enhanced fetch for API routes
export async function fetchAPI(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetchWithRetry(url, options);
}

// Fetch with JSON parsing and error handling
export async function fetchJSON<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithRetry(url, options);
  return response.json();
}

// Fetch API route with JSON parsing
export async function fetchAPIData<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchAPI(endpoint, options);
  return response.json();
}
