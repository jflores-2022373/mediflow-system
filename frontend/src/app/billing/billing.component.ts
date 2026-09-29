import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, Invoice } from '../services/mediflow.service';

@Component({
  selector: 'app-billing',
  standalone: true,
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

  newInvoice: Partial<Invoice> = {
    patientName: '',
    concept: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pagada'
  };

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoices = this.mediflowService.getInvoices();
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
      date: new Date().toISOString().split('T')[0],
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
    if (!this.newInvoice.patientName || !this.newInvoice.concept) {
      alert('Por favor complete el nombre del paciente y el concepto.');
      return;
    }

    if (this.isEditMode && this.editingId !== null) {
      const index = this.invoices.findIndex(i => i.id === this.editingId);
      if (index !== -1) {
        this.invoices[index] = { ...this.newInvoice } as Invoice;
      }
    } else {
      const newId = this.invoices.length > 0 ? Math.max(...this.invoices.map(i => i.id)) + 1 : 1;
      const invoiceToAdd: Invoice = {
        id: newId,
        patientName: this.newInvoice.patientName || '',
        concept: this.newInvoice.concept || '',
        amount: Number(this.newInvoice.amount) || 0,
        date: this.newInvoice.date || new Date().toISOString().split('T')[0],
        status: this.newInvoice.status || 'Pagada'
      };
      this.invoices.push(invoiceToAdd);
    }

    this.mediflowService.saveInvoices(this.invoices);
    this.closeModal();
  }

  deleteInvoice(id: number): void {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      this.invoices = this.invoices.filter(i => i.id !== id);
      this.mediflowService.saveInvoices(this.invoices);
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