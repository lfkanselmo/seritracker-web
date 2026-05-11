import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notification } from '../models/series.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly apiUrl = `${environment.apiUrl}/notifications`;

    constructor(private http: HttpClient) { }

    getUnread(userId: number): Observable<ApiResponse<Notification[]>> {
        return this.http.get<ApiResponse<Notification[]>>(this.apiUrl, {
            params: { userId: String(userId) }
        });
    }

    markAsRead(id: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {});
    }
}