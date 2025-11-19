/**
 * Get the API base URL based on environment
 * Priority: Environment variable > Production URL > Localhost
 */
export function getApiUrl(): string {
  // Check if environment variable is set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In production (not localhost), use the deployed backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://capstone3-6ywq.onrender.com';
  }

  // Default to localhost for development
  return 'http://localhost:5000';
}
