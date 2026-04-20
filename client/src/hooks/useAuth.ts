'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const router = useRouter();
  const { user, accessToken, login, logout, isLoading } = useAuthContext();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return { user, accessToken, isLoading, login: handleLogin, logout: handleLogout };
}
