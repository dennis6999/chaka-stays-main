/**
 * Google OAuth Configuration
 * 
 * To get your client ID:
 * 1. Go to https://console.cloud.google.com/
 * 2. Select your project
 * 3. Go to APIs & Services > Credentials
 * 4. Create OAuth 2.0 Client ID
 * 5. Copy the client ID and paste it below
 * 
 * The client ID should look like: 123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
 */
export const GOOGLE_CLIENT_ID = '886477367550-126e0735iquloh02m172sn2r2kvaj8g2.apps.googleusercontent.com';

/**
 * Google OAuth Configuration Options
 * 
 * flow: 'implicit' - Uses the implicit flow for OAuth
 * scope: 'email profile' - Requests access to user's email and profile information
 * response_type: 'token' - Requests an access token
 * prompt: 'select_account' - Always shows the account selector
 */
export const googleAuthConfig = {
  flow: 'implicit' as const,
  scope: 'email profile',
  response_type: 'token',
  prompt: 'select_account'
};

// Get the current origin (handles dynamic ports)
export const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Fallback for SSR
};

// Development server URL with fixed port
export const DEV_SERVER_URL = 'http://localhost:5173';

// Validate client ID format
export const validateClientId = (clientId: string): boolean => {
  return /^\d+-\w+\.apps\.googleusercontent\.com$/.test(clientId);
}; 