import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  // --- PACIENTES ---
  getPatients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/patients`);
  }
  createPatient(patient: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/patients`, patient);
  }
  updatePatient(id: number, patient: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/patients/${id}`, patient);
  }
  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/patients/${id}`);
  }

  // --- INVENTARIO / PRODUCTOS ---
  getInventory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory`);
  }
  createInventoryItem(item: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory`, item);
  }

  // --- CITAS ---
  getAppointments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/appointments`);
  }
  createAppointment(appointment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/appointments`, appointment);
  }

  // --- FACTURACIÓN ---
  getInvoices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices`);
  }
  createInvoice(invoice: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/invoices`, invoice);
  }
}