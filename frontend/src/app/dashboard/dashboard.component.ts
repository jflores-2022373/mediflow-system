import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MediflowService, Appointment, InventoryItem } from '../services/mediflow.service';
import { apiErrorMessage } from '../config';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalPatients: number = 0;
  totalAppointments: number = 0;
  totalInventoryItems: number = 0;
  totalRevenue: number = 0;

  recentAppointments: Appointment[] = [];
  inventoryItems: InventoryItem[] = [];

  barChartDynamicWidth: number = 900;

  private barChart?: Chart;
  private doughnutChart?: Chart;

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.doughnutChart?.destroy();
  }

  loadDashboardData(): void {
    forkJoin({
      patients: this.mediflowService.patients.list(),
      appointments: this.mediflowService.appointments.list(),
      inventory: this.mediflowService.inventory.list(),
      invoices: this.mediflowService.invoices.list()
    }).subscribe({
      next: ({ patients, appointments, inventory, invoices }) => {
        this.totalPatients = patients.length;
        this.totalAppointments = appointments.length;
        this.totalInventoryItems = inventory.length;

        this.totalRevenue = invoices
          .filter(i => i.status === 'Pagada')
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        this.recentAppointments = appointments;
        // Los insumos con stock bajo aparecen primero
        this.inventoryItems = [...inventory].sort(
          (a, b) => Number(b.stock <= b.minStock) - Number(a.stock <= a.minStock)
        );

        this.barChartDynamicWidth = Math.max(900, inventory.length * 110);

        // Espera a que Angular aplique el nuevo ancho antes de dibujar
        setTimeout(() => this.initCharts(inventory, appointments));
      },
      error: err => alert(apiErrorMessage(err, 'No se pudieron cargar los datos del panel.'))
    });
  }

  initCharts(inventory: InventoryItem[], appointments: Appointment[]): void {
    const itemNames = inventory.map(i => i.name);
    const itemStocks = inventory.map(i => i.stock);

    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (barCanvas) {
      this.barChart?.destroy();
      this.barChart = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: itemNames.length > 0 ? itemNames : ['Sin Insumos'],
          datasets: [{
            label: 'Stock Actual',
            data: itemStocks.length > 0 ? itemStocks : [0],
            backgroundColor: '#d4af37', // Tono Dorado Profesional
            borderRadius: 6,
            hoverBackgroundColor: '#e5c158',
            maxBarThickness: 45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111827',
              titleColor: '#d4af37',
              bodyColor: '#e5e7eb',
              borderColor: '#374151',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.04)' },
              ticks: { color: '#9ca3af', font: { family: 'Inter', size: 12 } }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: '#e5e7eb',
                font: { family: 'Inter', size: 12, weight: 500 },
                maxRotation: 0,
                autoSkip: false
              }
            }
          }
        }
      });
    }

    let countConfirmadas = 0;
    let countEnEspera = 0;
    let countCompletadas = 0;
    let countCanceladas = 0;

    appointments.forEach(app => {
      switch (app.status) {
        case 'En Espera': countEnEspera++; break;
        case 'Completada': countCompletadas++; break;
        case 'Cancelada': countCanceladas++; break;
        default: countConfirmadas++;
      }
    });

    const doughnutCanvas = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (doughnutCanvas) {
      this.doughnutChart?.destroy();
      this.doughnutChart = new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Confirmadas', 'En Espera', 'Completadas', 'Canceladas'],
          datasets: [{
            data: [countConfirmadas, countEnEspera, countCompletadas, countCanceladas],
            backgroundColor: ['#d4af37', '#3b82f6', '#10b981', '#ef4444'], // Dorado, Azul, Verde, Rojo institucional
            borderWidth: 3,
            borderColor: '#111827',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                color: '#d1d5db',
                font: { family: 'Inter', size: 12, weight: 500 }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
  }
}
