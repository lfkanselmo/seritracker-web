import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import { Notification } from '../models/series.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly apiUrl = `${environment.apiUrl}/notifications`;

    constructor(private http: HttpClient) { }

    getUnread(page = 0, size = 50): Observable<ApiResponse<PageResponse<Notification>>> {
        const params = { page: String(page), size: String(size) };
        return this.http.get<ApiResponse<PageResponse<Notification>>>(this.apiUrl, { params });
    }

    markAsRead(id: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {});
    }
}