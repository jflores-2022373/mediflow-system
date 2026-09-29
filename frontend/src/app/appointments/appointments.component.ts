import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Appointment } from '../services/mediflow.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
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

  newAppointment: Partial<Appointment> = {
    patientName: '',
    doctorName: '',
    specialty: 'Medicina General',
    date: '',
    time: '',
    phone: '',
    fee: 0,
    status: 'Confirmada'
  };

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointments = this.mediflowService.getAppointments();
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
      date: new Date().toISOString().split('T')[0],
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
    if (!this.newAppointment.patientName || !this.newAppointment.doctorName || !this.newAppointment.date) {
      alert('Por favor complete los campos obligatorios (Paciente, Doctor y Fecha).');
      return;
    }

    if (this.isEditMode && this.editingId !== null) {
      const index = this.appointments.findIndex(a => a.id === this.editingId);
      if (index !== -1) {
        this.appointments[index] = { ...this.newAppointment } as Appointment;
      }
    } else {
      const newId = this.appointments.length > 0 ? Math.max(...this.appointments.map(a => a.id)) + 1 : 1;
      const appointmentToAdd: Appointment = {
        id: newId,
        patientName: this.newAppointment.patientName || '',
        doctorName: this.newAppointment.doctorName || '',
        specialty: this.newAppointment.specialty || 'Medicina General',
        date: this.newAppointment.date || '',
        time: this.newAppointment.time || '10:00 AM',
        phone: this.newAppointment.phone || '+502 0000-0000',
        fee: Number(this.newAppointment.fee) || 0,
        status: (this.newAppointment.status as any) || 'Confirmada'
      };
      this.appointments.push(appointmentToAdd);
    }

    this.mediflowService.saveAppointments(this.appointments);
    this.closeModal();
  }

  deleteAppointment(id: number): void {
    if (confirm('¿Está seguro de eliminar o cancelar esta cita?')) {
      this.appointments = this.appointments.filter(a => a.id !== id);
      this.mediflowService.saveAppointments(this.appointments);
    }
  }

  getConfirmedCount(): number {
    return this.appointments.filter(a => a.status === 'Confirmada').length;
  }

  getWaitingCount(): number {
    return this.appointments.filter(a => a.status === 'En Espera').length;
  }
}