import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { TmdbSeries } from '../core/models/series.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {

  private readonly apiUrl = `${environment.apiUrl}/tmdb`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<ApiResponse<TmdbSeries[]>> {
    return this.http.get<ApiResponse<TmdbSeries[]>>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  getDetails(tmdbId: number): Observable<ApiResponse<TmdbSeries>> {
    return this.http.get<ApiResponse<TmdbSeries>>(`${this.apiUrl}/series/${tmdbId}`);
  }
}