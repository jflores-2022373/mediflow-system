import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Patient } from '../services/mediflow.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  editingId: number | null = null;

  patients: Patient[] = [];

  newPatient: Partial<Patient> = {
    fullName: '',
    age: 0,
    gender: 'Masculino',
    phone: '',
    bloodType: 'O+',
    consultationFee: 0,
    status: 'Activo'
  };

  constructor(
    private mediflowService: MediflowService,
    private cdr: ChangeDetectorRef // <--- Forzamos el renderizado instantáneo
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patients = this.mediflowService.getPatients();
    this.cdr.detectChanges(); // <--- Obliga a Angular a mostrar los datos al instante sin requerir clics
  }

  get filteredPatients(): Patient[] {
    if (!this.searchTerm.trim()) {
      return this.patients;
    }
    const term = this.searchTerm.toLowerCase();
    return this.patients.filter(p => 
      p.fullName.toLowerCase().includes(term) ||
      p.phone.toLowerCase().includes(term)
    );
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.newPatient = {
      fullName: '',
      age: 25,
      gender: 'Masculino',
      phone: '+502 ',
      bloodType: 'O+',
      consultationFee: 0,
      status: 'Activo'
    };
    this.showModal = true;
  }

  editPatient(patient: Patient): void {
    this.isEditMode = true;
    this.editingId = patient.id;
    this.newPatient = { ...patient };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  savePatient(): void {
    if (!this.newPatient.fullName || !this.newPatient.phone) {
      alert('Por favor ingrese el nombre y el teléfono del paciente.');
      return;
    }

    if (this.isEditMode && this.editingId !== null) {
      const index = this.patients.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.patients[index] = { ...this.newPatient } as Patient;
      }
    } else {
      const newId = this.patients.length > 0 ? Math.max(...this.patients.map(p => p.id)) + 1 : 1;
      const patientToAdd: Patient = {
        id: newId,
        fullName: this.newPatient.fullName || '',
        age: Number(this.newPatient.age) || 0,
        gender: (this.newPatient.gender as any) || 'Masculino',
        phone: this.newPatient.phone || '+502 0000-0000',
        bloodType: this.newPatient.bloodType || 'O+',
        consultationFee: Number(this.newPatient.consultationFee) || 0,
        status: (this.newPatient.status as any) || 'Activo'
      };
      this.patients.push(patientToAdd);
    }

    this.mediflowService.savePatients(this.patients);
    this.closeModal();
    this.cdr.detectChanges();
  }

  deletePatient(id: number): void {
    if (confirm('¿Está seguro de eliminar este expediente clínico?')) {
      this.patients = this.patients.filter(p => p.id !== id);
      this.mediflowService.savePatients(this.patients);
      this.cdr.detectChanges();
    }
  }

  getObservationCount(): number {
    return this.patients.filter(p => p.status === 'En Observación').length;
  }

  getDischargedCount(): number {
    return this.patients.filter(p => p.status === 'Alta').length;
  }
}