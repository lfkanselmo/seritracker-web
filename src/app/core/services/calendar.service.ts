import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UpcomingEpisode } from '../models/series.model';

@Injectable({ providedIn: 'root' })
export class CalendarService {

  private readonly apiUrl = `${environment.apiUrl}/calendar`;

  constructor(private http: HttpClient) {}

  getUpcoming(): Observable<ApiResponse<UpcomingEpisode[]>> {
    return this.http.get<ApiResponse<UpcomingEpisode[]>>(`${this.apiUrl}/upcoming`);
  }
}
