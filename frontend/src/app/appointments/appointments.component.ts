import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Appointment } from '../services/mediflow.service';
import { apiErrorMessage, todayLocal } from '../config';

@Component({
  selector: 'app-appointments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  editingId: number | null = null;

  appointments: Appointment[] = [];

  newAppointment: Partial<Appointment> = {};

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.mediflowService.appointments.list().subscribe({
      next: appointments => this.appointments = appointments,
      error: err => alert(apiErrorMessage(err, 'No se pudieron cargar las citas.'))
    });
  }

  get filteredAppointments(): Appointment[] {
    if (!this.searchTerm.trim()) {
      return this.appointments;
    }
    const term = this.searchTerm.toLowerCase();
    return this.appointments.filter(appt =>
      appt.patientName.toLowerCase().includes(term) ||
      appt.doctorName.toLowerCase().includes(term) ||
      appt.specialty.toLowerCase().includes(term)
    );
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.newAppointment = {
      patientName: '',
      doctorName: '',
      specialty: 'Medicina General',
      date: todayLocal(),
      time: '10:00 AM',
      phone: '+502 ',
      fee: 0,
      status: 'Confirmada'
    };
    this.showModal = true;
  }

  editAppointment(appt: Appointment): void {
    this.isEditMode = true;
    this.editingId = appt.id;
    this.newAppointment = { ...appt };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveAppointment(): void {
    const appt = this.newAppointment;
    if (!appt.patientName?.trim() || !appt.doctorName?.trim() || !appt.date || !appt.time?.trim() || !appt.phone?.trim()) {
      alert('Por favor complete los campos obligatorios (Paciente, Doctor, Fecha, Hora y Teléfono).');
      return;
    }

    const request = this.isEditMode && this.editingId !== null
      ? this.mediflowService.appointments.update(this.editingId, appt)
      : this.mediflowService.appointments.create(appt);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadAppointments();
      },
      error: err => alert(apiErrorMessage(err, 'No se pudo guardar la cita.'))
    });
  }

  deleteAppointment(id: number): void {
    if (confirm('¿Está seguro de eliminar o cancelar esta cita?')) {
      this.mediflowService.appointments.remove(id).subscribe({
        next: () => this.appointments = this.appointments.filter(a => a.id !== id),
        error: err => alert(apiErrorMessage(err, 'No se pudo eliminar la cita.'))
      });
    }
  }

  getConfirmedCount(): number {
    return this.appointments.filter(a => a.status === 'Confirmada').length;
  }

  getWaitingCount(): number {
    return this.appointments.filter(a => a.status === 'En Espera').length;
  }
}
