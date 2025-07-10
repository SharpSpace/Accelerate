import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workshop } from '../models/workshop';

@Injectable({
    providedIn: 'root'
})
export class LogService {

    private baseUrl = 'https://wfm-api-a8.azurewebsites.net';

    constructor(private http: HttpClient) { }

    authenticate(username: string, password: string) {
        return this.http.post(`${this.baseUrl}/api/Authentication`, { username, password });
    }

    getWorkshops(): Observable<Workshop[]> {
        return this.http.get<Workshop[]>(`${this.baseUrl}/api/Workshop`);
    }

    getLogsByWorkshop(workshopId: number, date: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/api/Workshop/${workshopId}/logs/GetLog?date=${date}`);
    }

}