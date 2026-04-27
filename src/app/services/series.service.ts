import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import {
  UserSeries,
  SeriesStatus,
  CreateSeriesRequest,
  UpdateStatusRequest,
  UpdateRatingRequest,
  UpdateEpisodesRequest
} from '../core/models/series.model';

@Injectable({ providedIn: 'root' })
export class SeriesService {

  private readonly apiUrl = `${environment.apiUrl}/series`;

  constructor(private http: HttpClient) {}

  getAll(userId: number, status?: SeriesStatus): Observable<ApiResponse<UserSeries[]>> {
    const params: Record<string, string> = { userId: String(userId) };
    if (status) params['status'] = status;
    return this.http.get<ApiResponse<UserSeries[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<UserSeries>> {
    return this.http.get<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}`);
  }

  create(userId: number, request: CreateSeriesRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.post<ApiResponse<UserSeries>>(`${this.apiUrl}?userId=${userId}`, request);
  }

  updateStatus(id: number, request: UpdateStatusRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.patch<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}/status`, request);
  }

  updateRating(id: number, request: UpdateRatingRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.patch<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}/rating`, request);
  }

  updateEpisodes(id: number, request: UpdateEpisodesRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.patch<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}/episodes`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}