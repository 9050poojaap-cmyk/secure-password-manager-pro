import axios from "axios";

export function createApi(getToken) {
  const instance = axios.create({
    baseURL: "/api",
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

