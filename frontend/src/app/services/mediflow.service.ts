import { Injectable } from '@angular/core';

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
  expirationDate?: string;
}

export interface Invoice {
  id: number;
  patientName: string;
  concept: string;
  amount: number;
  date: string;
  status: 'Pagada' | 'Pendiente' | 'Anulada';
}

@Injectable({
  providedIn: 'root'
})
export class MediflowService {
  private STORAGE_KEYS = {
    patients: 'mediflow_patients',
    appointments: 'mediflow_appointments',
    inventory: 'mediflow_inventory',
    invoices: 'mediflow_invoices'
  };

  getPatients(): Patient[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.patients);
    return data ? JSON.parse(data) : [
      { id: 1, fullName: 'Juan Pérez', age: 34, gender: 'Masculino', phone: '+502 5214-8965', bloodType: 'O+', consultationFee: 300.00, status: 'Activo' }
    ];
  }

  savePatients(patients: Patient[]): void {
    localStorage.setItem(this.STORAGE_KEYS.patients, JSON.stringify(patients));
  }

  getAppointments(): Appointment[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.appointments);
    return data ? JSON.parse(data) : [
      { id: 1, patientName: 'Carlos Mendoza', doctorName: 'Dr. Alejandro Estrada', specialty: 'Cardiología', date: '2026-06-10', time: '09:00 AM', phone: '+502 4512-7896', fee: 350.00, status: 'Confirmada' }
    ];
  }

  saveAppointments(appointments: Appointment[]): void {
    localStorage.setItem(this.STORAGE_KEYS.appointments, JSON.stringify(appointments));
  }

  getInventory(): InventoryItem[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.inventory);
    return data ? JSON.parse(data) : [
      { id: 1, name: 'Paracetamol 500mg', category: 'Analgésicos', stock: 150, minStock: 20, unitPrice: 25.00, supplier: 'Farmacéutica Central', expirationDate: '2028-12-31' }
    ];
  }

  saveInventory(inventory: InventoryItem[]): void {
    localStorage.setItem(this.STORAGE_KEYS.inventory, JSON.stringify(inventory));
  }

  getInvoices(): Invoice[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.invoices);
    return data ? JSON.parse(data) : [
      { id: 1, patientName: 'Juan Pérez', concept: 'Consulta General y Receta', amount: 300.00, date: '2026-09-28', status: 'Pagada' },
      { id: 2, patientName: 'Ana Lucía Gómez', concept: 'Exámenes de Laboratorio', amount: 450.00, date: '2026-09-27', status: 'Pendiente' }
    ];
  }

  saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.STORAGE_KEYS.invoices, JSON.stringify(invoices));
  }
}