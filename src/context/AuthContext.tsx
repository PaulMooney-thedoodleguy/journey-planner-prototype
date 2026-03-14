import { createContext, useContext, useState, useRef } from 'react';
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
  loginModalOpen: boolean;
  loginModalReason: string | null;
  openLoginModal: (reason?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(loadUser);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState<string | null>(null);

  // P1-C: capture the element that triggered the modal so focus can return on close
  const triggerElementRef = useRef<Element | null>(null);

  const openLoginModal = (reason?: string) => {
    triggerElementRef.current = document.activeElement;
    setLoginModalReason(reason ?? null);
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    // Return focus after the modal's close transition (~200 ms) — WCAG 2.4.3
    const trigger = triggerElementRef.current;
    if (trigger && 'focus' in trigger) {
      setTimeout(() => (trigger as HTMLElement).focus(), 210);
    }
  };

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
    <AuthContext.Provider value={{
      user, isLoggedIn: !!user, login, register, logout, updateProfile, clearAllData,
      loginModalOpen, loginModalReason, openLoginModal, closeLoginModal,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
