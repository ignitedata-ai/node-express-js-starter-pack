import api, { setAccessToken } from './api';

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
    const token = data.data.accessToken;
    setAccessToken(token);
    return token;
  } catch {
    return null;
  }
}
