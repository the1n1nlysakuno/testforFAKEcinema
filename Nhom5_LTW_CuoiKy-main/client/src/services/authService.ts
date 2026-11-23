import type { AuthResponse, User, UserRole } from '../types/index';
import {
  ApiError,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  api,
  isNetworkError,
} from './api';

const OFFLINE_USERS_KEY = 'cgv_offline_users';

interface OfflineAccount extends User {
  password: string;
}

function readOfflineAccounts(): OfflineAccount[] {
  try {
    const raw = localStorage.getItem(OFFLINE_USERS_KEY);
    return raw ? (JSON.parse(raw) as OfflineAccount[]) : [];
  } catch {
    return [];
  }
}

function writeOfflineAccounts(accounts: OfflineAccount[]): void {
  localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(accounts));
}

function saveSession(user: User, token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function inferRoleFromEmail(email: string): UserRole {
  return email.trim().toLowerCase().startsWith('admin@') ? 'admin' : 'user';
}

function inferNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] || 'Khách hàng';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function toPublicUser(account: OfflineAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: normalizedEmail,
      password,
    });
    saveSession(response.user, response.token);
    return response;
  } catch (error) {
    if (!isNetworkError(error)) throw error;

    if (!normalizedEmail || !password.trim()) {
      throw new ApiError('Vui lòng nhập đầy đủ email và mật khẩu.', 400, 'BAD_REQUEST');
    }

    const accounts = readOfflineAccounts();
    const existing = accounts.find(
      account => account.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      if (existing.password !== password) {
        throw new ApiError('Email hoặc mật khẩu không đúng.', 401, 'UNAUTHORIZED');
      }
      const user = toPublicUser(existing);
      const token = `offline-token-${user.id}-${Date.now()}`;
      saveSession(user, token);
      return { user, token };
    }

    const demoUser: User = {
      id: `user-${Date.now()}`,
      name: inferNameFromEmail(normalizedEmail),
      email: normalizedEmail,
      role: inferRoleFromEmail(normalizedEmail),
    };
    const token = `offline-token-${demoUser.id}`;
    writeOfflineAccounts([...accounts, { ...demoUser, password }]);
    saveSession(demoUser, token);
    return { user: demoUser, token };
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await api.post<AuthResponse>('/auth/register', {
      name: normalizedName,
      email: normalizedEmail,
      password,
    });
    saveSession(response.user, response.token);
    return response;
  } catch (error) {
    if (!isNetworkError(error)) throw error;

    if (!normalizedName || !normalizedEmail || !password.trim()) {
      throw new ApiError(
        'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.',
        400,
        'BAD_REQUEST'
      );
    }

    const accounts = readOfflineAccounts();
    const duplicated = accounts.some(
      account => account.email.toLowerCase() === normalizedEmail
    );
    if (duplicated) {
      throw new ApiError('Email này đã được đăng ký.', 409, 'CONFLICT');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: normalizedName,
      email: normalizedEmail,
      role: inferRoleFromEmail(normalizedEmail),
    };
    const token = `offline-token-${newUser.id}`;
    writeOfflineAccounts([...accounts, { ...newUser, password }]);
    saveSession(newUser, token);
    return { user: newUser, token };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  try {
    const user = await api.get<User>('/auth/me');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (!isNetworkError(error)) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }

    try {
      const rawUser = localStorage.getItem(USER_STORAGE_KEY);
      return rawUser ? (JSON.parse(rawUser) as User) : null;
    } catch {
      return null;
    }
  }
}

export async function logout(): Promise<void> {
  try {
    if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
      await api.post<void>('/auth/logout');
    }
  } catch (error) {
    if (!isNetworkError(error) && !(error instanceof ApiError && error.status === 401)) {
      throw error;
    }
  } finally {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}
