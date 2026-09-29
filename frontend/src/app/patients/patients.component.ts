import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Patient } from '../services/mediflow.service';
import { apiErrorMessage } from '../config';

@Component({
  selector: 'app-patients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
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

  newPatient: Partial<Patient> = {};

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.mediflowService.patients.list().subscribe({
      next: patients => this.patients = patients,
      error: err => alert(apiErrorMessage(err, 'No se pudieron cargar los pacientes.'))
    });
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
    if (!this.newPatient.fullName?.trim() || !this.newPatient.phone?.trim()) {
      alert('Por favor ingrese el nombre y el teléfono del paciente.');
      return;
    }

    const request = this.isEditMode && this.editingId !== null
      ? this.mediflowService.patients.update(this.editingId, this.newPatient)
      : this.mediflowService.patients.create(this.newPatient);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadPatients();
      },
      error: err => alert(apiErrorMessage(err, 'No se pudo guardar el paciente.'))
    });
  }

  deletePatient(id: number): void {
    if (confirm('¿Está seguro de eliminar este expediente clínico?')) {
      this.mediflowService.patients.remove(id).subscribe({
        next: () => this.patients = this.patients.filter(p => p.id !== id),
        error: err => alert(apiErrorMessage(err, 'No se pudo eliminar el paciente.'))
      });
    }
  }

  getObservationCount(): number {
    return this.patients.filter(p => p.status === 'En Observación').length;
  }

  getDischargedCount(): number {
    return this.patients.filter(p => p.status === 'Alta').length;
  }
}
