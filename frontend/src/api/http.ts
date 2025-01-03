import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import qs from "qs";

// Primary Axios instance

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

// Alternate Axios instances

export const uninterceptedInstance = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  withCredentials: true,
});

// Automatically attempt access token refresh

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

const clearAuthCookies = () => {
  return uninterceptedInstance.post("/api/auth/logout/");
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (
      error.response?.status === 401 &&
      (error.response?.data as any)?.code !== "tokens_missing" &&
      originalRequest.url !== "/api/auth/token-refresh/"
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          await uninterceptedInstance.post("/api/auth/token-refresh/");
          isRefreshing = false;
          processQueue();
          return http(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError);
          await clearAuthCookies();
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return http(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
    return Promise.reject(error);
  }
);

// Base model class for API endpoints

export class BaseModel<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  create(data: any, config: any = {}) {
    return http.post<T>(`${this.endpoint}`, data, config);
  }

  get(id: number | string, params: any = {}) {
    return http.get<T>(`${this.endpoint}${id}/`, { params });
  }

  list(params: any = {}) {
    return http.get<T[]>(`${this.endpoint}`, { params });
  }

  update(id: number | string, data: any, config = {}, patch = true) {
    if (patch) {
      return http.patch<T>(`${this.endpoint}${id}/`, data, config);
    }
    return http.put<T>(`${this.endpoint}${id}/`, data, config);
  }

  delete(id: number | string) {
    return http.delete(`${this.endpoint}${id}/`);
  }

  detailAction(
    id: number | string,
    action: string,
    method: string,
    data: any = {},
    params: any = {},
    config: any = {}
  ) {
    return http.request({
      url: `${this.endpoint}${id}/${action}/`,
      method,
      data,
      params,
      ...config,
    });
  }

  listAction(action: string, method: string, data: any = {}, params: any = {}, config: any = {}) {
    return http.request({
      url: `${this.endpoint}${action}/`,
      method,
      data,
      params,
      ...config,
    });
  }
}
