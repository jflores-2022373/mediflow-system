const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Archivo de base de datos local simulada para persistencia
const DB_FILE = path.join(__dirname, 'database.json');

// Datos iniciales por defecto si no existe la base de datos
const initialData = {
  patients: [
    { id: 1, name: 'Carlos Mendoza Ruiz', age: 38, phone: '+502 5512-3456', email: 'carlos.mendoza@gmail.com', gender: 'Masculino' },
    { id: 2, name: 'María Fernanda Gómez', age: 29, phone: '+502 4211-9889', email: 'mafe.gomez@yahoo.com', gender: 'Femenino' },
    { id: 3, name: 'Roberto Sotomayor', age: 52, phone: '+502 5188-7744', email: 'roberto.soto@outlook.com', gender: 'Masculino' }
  ],
  inventory: [
    { id: 1, name: 'Paracetamol 500mg', category: 'Analgésicos', stock: 120, price: 15.00, minStock: 20 },
    { id: 2, name: 'Amoxicilina 500mg', category: 'Antibióticos', stock: 45, price: 47.50, minStock: 10 },
    { id: 3, name: 'Ibuprofeno 600mg', category: 'Antiinflamatorios', stock: 8, price: 22.00, minStock: 15 }
  ],
  appointments: [
    { id: 1, patientName: 'Carlos Mendoza Ruiz', doctor: 'Dr. Ramírez', date: '2026-09-28', time: '09:00 AM', status: 'Confirmada' },
    { id: 2, patientName: 'María Fernanda Gómez', doctor: 'Dra. Castillo', date: '2026-09-28', time: '10:30 AM', status: 'Pendiente' }
  ],
  invoices: [
    {
      id: 1,
      invoiceNumber: 'FAC-2026-001',
      patientName: 'Carlos Mendoza Ruiz',
      date: '2026-09-28',
      items: [
        { description: 'Consulta Medicina General', quantity: 1, unitPrice: 250.00 },
        { description: 'Paracetamol 500mg (Caja)', quantity: 2, unitPrice: 15.00 }
      ],
      total: 280.00,
      paymentMethod: 'Efectivo',
      status: 'Pagada'
    }
  ]
};

// Cargar o inicializar la base de datos
const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const saveDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- RUTAS DE PACIENTES ---
app.get('/api/patients', (req, res) => {
  const db = getDB();
  res.json(db.patients);
});

app.post('/api/patients', (req, res) => {
  const db = getDB();
  const newPatient = { id: Date.now(), ...req.body };
  db.patients.unshift(newPatient);
  saveDB(db);
  res.status(201).json(newPatient);
});

app.delete('/api/patients/:id', (req, res) => {
  const db = getDB();
  db.patients = db.patients.filter(p => p.id !== Number(req.params.id));
  saveDB(db);
  res.json({ success: true });
});

// --- RUTAS DE INVENTARIO ---
app.get('/api/inventory', (req, res) => {
  const db = getDB();
  res.json(db.inventory);
});

app.post('/api/inventory', (req, res) => {
  const db = getDB();
  const newItem = { id: Date.now(), ...req.body };
  db.inventory.unshift(newItem);
  saveDB(db);
  res.status(201).json(newItem);
});

// --- RUTAS DE CITAS ---
app.get('/api/appointments', (req, res) => {
  const db = getDB();
  res.json(db.appointments);
});

app.post('/api/appointments', (req, res) => {
  const db = getDB();
  const newAppt = { id: Date.now(), ...req.body };
  db.appointments.unshift(newAppt);
  saveDB(db);
  res.status(201).json(newAppt);
});

// --- RUTAS DE FACTURACIÓN ---
app.get('/api/invoices', (req, res) => {
  const db = getDB();
  res.json(db.invoices);
});

app.post('/api/invoices', (req, res) => {
  const db = getDB();
  const id = Date.now();
  const invoiceNumber = `FAC-2026-0${Math.floor(Math.random() * 900) + 100}`;
  const newInvoice = { id, invoiceNumber, ...req.body };
  db.invoices.unshift(newInvoice);
  saveDB(db);
  res.status(201).json(newInvoice);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend de MediFlow corriendo exitosamente en http://localhost:${PORT}`);
});