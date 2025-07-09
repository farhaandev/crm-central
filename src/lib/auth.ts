
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const AUTH_KEY = 'crm_user';

export const loginUser = (user: User): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(AUTH_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Demo user for login simulation
export const DEMO_USER: User = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@company.com',
  role: 'Sales Manager',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
};
