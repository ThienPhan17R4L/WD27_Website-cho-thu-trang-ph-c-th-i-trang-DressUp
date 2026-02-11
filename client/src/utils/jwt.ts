/**
 * Client-side JWT utility functions
 * NOTE: These functions only decode the token, they do NOT verify the signature
 * Token verification should happen on the server side
 */

interface JWTPayload {
  sub: string;
  type: string;
  iat?: number; // Issued at (seconds since epoch)
  exp?: number; // Expiration (seconds since epoch)
}

/**
 * Decode JWT token without verification (client-side only)
 * Returns the payload or null if invalid
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * Returns true if expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get token expiration time in milliseconds
 * Returns null if token is invalid or has no expiration
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return null;

  // Convert seconds to milliseconds
  return payload.exp * 1000;
}

/**
 * Get time until token expires in milliseconds
 * Returns 0 if already expired, null if invalid
 */
export function getTimeUntilExpiry(token: string): number | null {
  const expirationTime = getTokenExpiration(token);
  if (expirationTime === null) return null;

  const timeUntilExpiry = expirationTime - Date.now();
  return Math.max(0, timeUntilExpiry);
}
