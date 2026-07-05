import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { UserSeries, SeriesStatus, CreateSeriesRequest, UpdateStatusRequest, UpdateRatingRequest, UpdateEpisodesRequest, UpdateNotesRequest, SeriesSortBy, SortDirection } from '../models/series.model';

export interface SeriesQueryOptions {
  status?: SeriesStatus;
  page?: number;
  size?: number;
  search?: string;
  sortBy?: SeriesSortBy;
  sortDir?: SortDirection;
}

@Injectable({ providedIn: 'root' })
export class SeriesService {

  private readonly apiUrl = `${environment.apiUrl}/series`;

  constructor(private http: HttpClient) {}

  getAll(options: SeriesQueryOptions = {}): Observable<ApiResponse<PageResponse<UserSeries>>> {
    const { status, page = 0, size = 20, search, sortBy, sortDir } = options;
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    if (sortBy) params['sortBy'] = sortBy;
    if (sortDir) params['sortDir'] = sortDir;
    return this.http.get<ApiResponse<PageResponse<UserSeries>>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<UserSeries>> {
    return this.http.get<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateSeriesRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.post<ApiResponse<UserSeries>>(this.apiUrl, request);
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

  updateNotes(id: number, request: UpdateNotesRequest): Observable<ApiResponse<UserSeries>> {
    return this.http.patch<ApiResponse<UserSeries>>(`${this.apiUrl}/${id}/notes`, request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}