import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediflowService, InventoryItem } from '../services/mediflow.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
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

  newMedicine: Partial<InventoryItem> = {
    name: '',
    category: 'Analgésicos',
    stock: 0,
    minStock: 20,
    unitPrice: 0,
    supplier: '',
    expirationDate: ''
  };

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.medicines = this.mediflowService.getInventory();
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
    if (!this.newMedicine.name) {
      alert('Por favor ingrese el nombre del medicamento o insumo.');
      return;
    }

    if (this.isEditMode && this.editingId !== null) {
      const index = this.medicines.findIndex(m => m.id === this.editingId);
      if (index !== -1) {
        this.medicines[index] = { ...this.newMedicine } as InventoryItem;
      }
    } else {
      const newId = this.medicines.length > 0 ? Math.max(...this.medicines.map(m => m.id)) + 1 : 1;
      const medicineToAdd: InventoryItem = {
        id: newId,
        name: this.newMedicine.name || '',
        category: this.newMedicine.category || 'Analgésicos',
        stock: Number(this.newMedicine.stock) || 0,
        minStock: 20,
        unitPrice: Number(this.newMedicine.unitPrice) || 0,
        supplier: this.newMedicine.supplier || 'Proveedor General',
        expirationDate: this.newMedicine.expirationDate || '2027-01-01'
      };
      this.medicines.push(medicineToAdd);
    }

    this.mediflowService.saveInventory(this.medicines);
    this.closeModal();
  }

  deleteMedicine(id: number): void {
    if (confirm('¿Está seguro de eliminar este medicamento del inventario?')) {
      this.medicines = this.medicines.filter(m => m.id !== id);
      this.mediflowService.saveInventory(this.medicines);
    }
  }

  getLowStockCount(): number {
    return this.medicines.filter(m => m.stock < 20).length;
  }
}