import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import type {
  ApiResponse,
  RegisterPayload,
  User,
  UsersPageData,
} from '../models/api.types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  register(payload: RegisterPayload): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${API_BASE_URL}/users`,
      payload
    );
  }

  getUsers(page = 1, limit = 10): Observable<ApiResponse<UsersPageData>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<ApiResponse<UsersPageData>>(
      `${API_BASE_URL}/users`,
      { params }
    );
  }
}
