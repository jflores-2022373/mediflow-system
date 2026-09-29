import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';

export interface Patient {
  id: number;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  bloodType: string;
  consultationFee: number;
  status: 'Activo' | 'En Observación' | 'Alta';
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  phone: string;
  fee: number;
  status: 'Confirmada' | 'En Espera' | 'Completada' | 'Cancelada';
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  supplier: string;
  expirationDate?: string | null;
}

export interface Invoice {
  id: number;
  patientName: string;
  concept: string;
  amount: number;
  date: string;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

// Operaciones CRUD genéricas contra un recurso del backend
class Resource<T extends { id: number }> {
  constructor(private http: HttpClient, private url: string) {}

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }
  create(item: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url, item);
  }
  update(id: number, item: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, item);
  }
  remove(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class MediflowService {
  readonly patients: Resource<Patient>;
  readonly appointments: Resource<Appointment>;
  readonly inventory: Resource<InventoryItem>;
  readonly invoices: Resource<Invoice>;

  constructor(http: HttpClient) {
    this.patients = new Resource<Patient>(http, `${API_URL}/patients`);
    this.appointments = new Resource<Appointment>(http, `${API_URL}/appointments`);
    this.inventory = new Resource<InventoryItem>(http, `${API_URL}/inventory`);
    this.invoices = new Resource<Invoice>(http, `${API_URL}/invoices`);
  }
}
