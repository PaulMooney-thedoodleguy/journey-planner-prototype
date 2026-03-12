import { createContext, useContext, useState } from 'react';
import type { UserProfile } from '../types';
import {
  loadUser, saveUser, clearCurrentUser,
  loadUsers, saveUsers, clearAllAppData,
} from '../utils/authStorage';

interface AuthContextValue {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'email' | 'homeStation' | 'defaultRailcard'>>) => void;
  clearAllData: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(loadUser);

  function login(email: string, _password: string): string | null {
    const users = loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) return 'No account found — please register';
    saveUser(found);
    setUser(found);
    return null;
  }

  function register(name: string, email: string, _password: string): string | null {
    const trimName  = name.trim();
    const trimEmail = email.trim();
    if (!trimName)  return 'Please enter your full name';
    if (!trimEmail) return 'Please enter your email address';
    if (!/\S+@\S+\.\S+/.test(trimEmail)) return 'Please enter a valid email address';

    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === trimEmail.toLowerCase())) {
      return 'An account with this email already exists';
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      name: trimName,
      email: trimEmail,
      createdAt: new Date().toISOString(),
      defaultRailcard: 'none',
    };
    saveUsers([...users, newUser]);
    saveUser(newUser);
    setUser(newUser);
    return null;
  }

  function logout(): void {
    clearCurrentUser();
    setUser(null);
  }

  function updateProfile(updates: Partial<Pick<UserProfile, 'name' | 'email' | 'homeStation' | 'defaultRailcard'>>): void {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
    const users = loadUsers().map(u => u.id === updated.id ? updated : u);
    saveUsers(users);
    setUser(updated);
  }

  function clearAllData(): void {
    clearAllAppData();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, register, logout, updateProfile, clearAllData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
