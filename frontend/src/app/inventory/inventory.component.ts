import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, InventoryItem } from '../services/mediflow.service';
import { apiErrorMessage } from '../config';

@Component({
  selector: 'app-inventory',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  editingId: number | null = null;

  medicines: InventoryItem[] = [];

  newMedicine: Partial<InventoryItem> = {};

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.mediflowService.inventory.list().subscribe({
      next: items => this.medicines = items,
      error: err => alert(apiErrorMessage(err, 'No se pudo cargar el inventario.'))
    });
  }

  get filteredMedicines(): InventoryItem[] {
    if (!this.searchTerm.trim()) {
      return this.medicines;
    }
    const term = this.searchTerm.toLowerCase();
    return this.medicines.filter(med =>
      med.name.toLowerCase().includes(term) ||
      med.category.toLowerCase().includes(term) ||
      med.supplier.toLowerCase().includes(term)
    );
  }

  isLowStock(med: InventoryItem): boolean {
    return med.stock <= med.minStock;
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.newMedicine = {
      name: '',
      category: 'Analgésicos',
      stock: 0,
      minStock: 20,
      unitPrice: 0.00,
      supplier: '',
      expirationDate: ''
    };
    this.showModal = true;
  }

  editMedicine(med: InventoryItem): void {
    this.isEditMode = true;
    this.editingId = med.id;
    this.newMedicine = { ...med };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMedicine(): void {
    if (!this.newMedicine.name?.trim() || !this.newMedicine.supplier?.trim()) {
      alert('Por favor ingrese el nombre del medicamento y el proveedor.');
      return;
    }

    const request = this.isEditMode && this.editingId !== null
      ? this.mediflowService.inventory.update(this.editingId, this.newMedicine)
      : this.mediflowService.inventory.create(this.newMedicine);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadMedicines();
      },
      error: err => alert(apiErrorMessage(err, 'No se pudo guardar el medicamento.'))
    });
  }

  deleteMedicine(id: number): void {
    if (confirm('¿Está seguro de eliminar este medicamento del inventario?')) {
      this.mediflowService.inventory.remove(id).subscribe({
        next: () => this.medicines = this.medicines.filter(m => m.id !== id),
        error: err => alert(apiErrorMessage(err, 'No se pudo eliminar el medicamento.'))
      });
    }
  }

  getLowStockCount(): number {
    return this.medicines.filter(m => this.isLowStock(m)).length;
  }
}
