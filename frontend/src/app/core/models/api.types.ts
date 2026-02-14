/** Usuario (sin password) tal como lo devuelve la API */
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

/** Respuesta estándar de la API */
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

/** Respuesta de login */
export interface LoginResponse {
  user: User;
  token: string;
}

/** Respuesta paginada de usuarios (formato backend) */
export interface UsersPageData {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
