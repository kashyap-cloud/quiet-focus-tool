 /**
  * Auth helper for external authentication handshake preparation.
  * This utility provides a way to resolve the current user identity
  * from sessionStorage without blocking UI or redirecting.
  */
 
 const USER_ID_KEY = 'user_id';
 
 /**
  * Get the current user ID from sessionStorage.
  * Returns null if no user is logged in.
  * Does NOT redirect, block UI, or call external APIs.
  */
 export function getCurrentUserId(): string | null {
   try {
     return sessionStorage.getItem(USER_ID_KEY);
   } catch {
     // sessionStorage may not be available (SSR, privacy mode, etc.)
     return null;
   }
 }
 
 /**
  * Set the current user ID in sessionStorage.
  * Used during external authentication handshake.
  */
 export function setCurrentUserId(userId: string): void {
   try {
     sessionStorage.setItem(USER_ID_KEY, userId);
   } catch {
     // Silently fail if sessionStorage is not available
   }
 }
 
 /**
  * Clear the current user ID from sessionStorage.
  * Used during logout.
  */
 export function clearCurrentUserId(): void {
   try {
     sessionStorage.removeItem(USER_ID_KEY);
   } catch {
     // Silently fail if sessionStorage is not available
   }
 }
 
 /**
  * Check if a user is currently authenticated.
  */
 export function isAuthenticated(): boolean {
   return getCurrentUserId() !== null;
 }