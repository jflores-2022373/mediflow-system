import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Invoice } from '../services/mediflow.service';
import { apiErrorMessage, todayLocal } from '../config';

@Component({
  selector: 'app-billing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  editingId: number | null = null;

  invoices: Invoice[] = [];

  newInvoice: Partial<Invoice> = {};

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.mediflowService.invoices.list().subscribe({
      next: invoices => this.invoices = invoices,
      error: err => alert(apiErrorMessage(err, 'No se pudieron cargar las facturas.'))
    });
  }

  get filteredInvoices(): Invoice[] {
    if (!this.searchTerm.trim()) {
      return this.invoices;
    }
    const term = this.searchTerm.toLowerCase();
    return this.invoices.filter(inv =>
      inv.patientName.toLowerCase().includes(term) ||
      inv.concept.toLowerCase().includes(term) ||
      inv.status.toLowerCase().includes(term)
    );
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.newInvoice = {
      patientName: '',
      concept: '',
      amount: 0,
      date: todayLocal(),
      status: 'Pagada'
    };
    this.showModal = true;
  }

  editInvoice(inv: Invoice): void {
    this.isEditMode = true;
    this.editingId = inv.id;
    this.newInvoice = { ...inv };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveInvoice(): void {
    if (!this.newInvoice.patientName?.trim() || !this.newInvoice.concept?.trim()) {
      alert('Por favor complete el nombre del paciente y el concepto.');
      return;
    }

    const request = this.isEditMode && this.editingId !== null
      ? this.mediflowService.invoices.update(this.editingId, this.newInvoice)
      : this.mediflowService.invoices.create(this.newInvoice);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadInvoices();
      },
      error: err => alert(apiErrorMessage(err, 'No se pudo guardar la factura.'))
    });
  }

  deleteInvoice(id: number): void {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      this.mediflowService.invoices.remove(id).subscribe({
        next: () => this.invoices = this.invoices.filter(i => i.id !== id),
        error: err => alert(apiErrorMessage(err, 'No se pudo eliminar la factura.'))
      });
    }
  }

  getTotalIncome(): number {
    return this.invoices
      .filter(i => i.status === 'Pagada')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }

  getPendingCount(): number {
    return this.invoices.filter(i => i.status === 'Pendiente').length;
  }
}
