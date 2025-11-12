// Authentication utilities

export interface User {
  id: string;
  username: string;
  email: string;
}

/**
 * Get the current logged-in user from sessionStorage
 */
export const getUser = (): User | null => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Save user to sessionStorage
 */
export const setUser = (user: User): void => {
  sessionStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove user from sessionStorage
 */
export const clearUser = (): void => {
  sessionStorage.removeItem('user');
  // Also clear localStorage for backwards compatibility
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

/**
 * Get user ID
 */
export const getUserId = (): string | null => {
  const user = getUser();
  return user?.id || null;
};

/**
 * Logout user - clears session storage and calls logout API
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout API to clear httpOnly cookie
    const { logoutUser } = await import('../api/auth');
    await logoutUser();
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear local storage even if API call fails
    clearUser();
  }
};
