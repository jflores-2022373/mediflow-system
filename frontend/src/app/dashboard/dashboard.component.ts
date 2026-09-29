import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediflowService, Patient, Appointment, InventoryItem, Invoice } from '../services/mediflow.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  totalPatients: number = 0;
  totalAppointments: number = 0;
  totalInventoryItems: number = 0;
  totalRevenue: number = 0;

  recentAppointments: Appointment[] = [];
  lowStockItems: InventoryItem[] = [];
  
  barChartDynamicWidth: number = 900;

  private barChart: any;
  private doughnutChart: any;

  constructor(private mediflowService: MediflowService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 150);
  }

  loadDashboardData(): void {
    const patients = this.mediflowService.getPatients();
    const appointments = this.mediflowService.getAppointments();
    const inventory = this.mediflowService.getInventory();
    const invoices = this.mediflowService.getInvoices();

    this.totalPatients = patients.length;
    this.totalAppointments = appointments.length;
    this.totalInventoryItems = inventory.length;

    this.totalRevenue = invoices
      .filter(i => i.status === 'Pagada')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    this.recentAppointments = appointments;
    this.lowStockItems = inventory;

    if (inventory.length > 0) {
      this.barChartDynamicWidth = Math.max(900, inventory.length * 110);
    } else {
      this.barChartDynamicWidth = 900;
    }
  }

  initCharts(): void {
    const inventory = this.mediflowService.getInventory();
    const appointments = this.mediflowService.getAppointments();

    const itemNames = inventory.map(i => i.name);
    const itemStocks = inventory.map(i => i.stock);

    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (barCanvas) {
      if (this.barChart) this.barChart.destroy();
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
      const estado = (app.status || '').toLowerCase();
      if (estado.includes('confirm')) countConfirmadas++;
      else if (estado.includes('espera') || estado.includes('pendiente')) countEnEspera++;
      else if (estado.includes('complet') || estado.includes('atendid')) countCompletadas++;
      else if (estado.includes('cancel')) countCanceladas++;
      else countConfirmadas++;
    });

    if (countConfirmadas === 0 && countEnEspera === 0 && countCompletadas === 0 && countCanceladas === 0) {
      countConfirmadas = 1;
    }

    const doughnutCanvas = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (doughnutCanvas) {
      if (this.doughnutChart) this.doughnutChart.destroy();
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