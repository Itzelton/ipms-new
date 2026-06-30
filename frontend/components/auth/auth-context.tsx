"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN' | null;

type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  verified: boolean;
  course?: string;
  level?: string;
  studentId?: string;
  indexNumber?: string;
  createdAt: string;
};

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  verified: boolean;
};

type AuthContextType = {
  user: SessionUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: Role,
    course?: string,
    level?: string,
    studentId?: string,
    indexNumber?: string
  ) => Promise<void>;
  verifyAccount: (email: string) => void;
  logout: () => void;
  getAllUsers: () => User[];
  approveUser: (email: string) => void;
  rejectUser: (email: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'ipms_users_registered';
const SESSION_KEY = 'ipms_session';

function getRegisteredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function generateId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (runs once)
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
    setHydrated(true);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check registered users first
    const users = getRegisteredUsers();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (found) {
      if (found.password !== password) {
        throw new Error('Invalid password');
      }
      if (!found.verified) {
        throw new Error('Account not verified. Please go through the verification process before signing in.');
      }
      const sessionUser: SessionUser = {
        id: found.id,
        email: found.email,
        name: found.name,
        role: found.role,
        verified: found.verified,
      };
      setUser(sessionUser);
      saveSession(sessionUser);
      return;
    }

    // Dev mode test accounts fallback
    const isTestPassword = password === 'password123';
    const roleGuess = normalizedEmail.includes('admin')
      ? 'ADMIN'
      : normalizedEmail.includes('supervisor') || normalizedEmail.includes('lecturer')
        ? 'SUPERVISOR'
        : normalizedEmail.includes('student')
          ? 'STUDENT'
          : null;

    if (isTestPassword && roleGuess) {
      const sessionUser: SessionUser = {
        id: `dev-${roleGuess.toLowerCase()}`,
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: roleGuess as Role,
        verified: true,
      };
      setUser(sessionUser);
      saveSession(sessionUser);

      // Also save as a registered user for future logins
      const users = getRegisteredUsers();
      if (!users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
        users.push({
          id: sessionUser.id,
          email: normalizedEmail,
          password,
          name: sessionUser.name,
          role: sessionUser.role,
          verified: true,
          createdAt: new Date().toISOString(),
        });
        saveRegisteredUsers(users);
      }
      return;
    }

    throw new Error('No account found with this email. Please create an account first.');
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: Role,
    course?: string,
    level?: string,
    studentId?: string,
    indexNumber?: string
  ): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();

    if (users.find((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const newUser: User = {
      id: generateId(),
      email: normalizedEmail,
      password,
      name: name.trim(),
      role,
      verified: false,
      course,
      level,
      studentId,
      indexNumber,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    // Signal to the register page that verification is needed
    throw new Error('VERIFICATION_REQUIRED');
  };

  const verifyAccount = (email: string) => {
    const users = getRegisteredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) throw new Error('User not found');
    found.verified = true;
    saveRegisteredUsers(users);

    const sessionUser: SessionUser = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
      verified: true,
    };
    setUser(sessionUser);
    saveSession(sessionUser);
  };

  const logout = () => {
    setUser(null);
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const getAllUsers = (): User[] => {
    return getRegisteredUsers();
  };

  const approveUser = (email: string) => {
    const users = getRegisteredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      found.verified = true;
      saveRegisteredUsers(users);
    }
  };

  const rejectUser = (email: string) => {
    const users = getRegisteredUsers();
    const filtered = users.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    saveRegisteredUsers(filtered);
  };

  return (
    <AuthContext.Provider value={{ user, hydrated, login, register, verifyAccount, logout, getAllUsers, approveUser, rejectUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
