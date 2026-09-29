import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { createCrudRouter } from './lib/crud.js';
import { requireAuth } from './lib/auth.js';

if (!process.env.JWT_SECRET || !process.env.GOOGLE_CLIENT_ID) {
  console.error('❌ Faltan variables de entorno. Copie .env.example a .env y complete JWT_SECRET y GOOGLE_CLIENT_ID.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

// --- AUTENTICACIÓN (pública) ---
app.use('/api/auth', authRoutes);

// --- A partir de aquí todas las rutas requieren sesión ---
app.use('/api', requireAuth);

// --- PACIENTES ---
app.use('/api/patients', createCrudRouter('patient', {
  fullName: { type: 'string', required: true },
  age: { type: 'int', required: true, min: 0 },
  gender: { type: 'string', required: true, enum: ['Masculino', 'Femenino', 'Otro'] },
  phone: { type: 'string', required: true },
  bloodType: { type: 'string', enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
  consultationFee: { type: 'float', min: 0 },
  status: { type: 'string', enum: ['Activo', 'En Observación', 'Alta'] }
}, 'Paciente'));

// --- INVENTARIO ---
app.use('/api/inventory', createCrudRouter('inventoryItem', {
  name: { type: 'string', required: true },
  category: { type: 'string', required: true },
  stock: { type: 'int', required: true, min: 0 },
  minStock: { type: 'int', min: 0 },
  unitPrice: { type: 'float', required: true, min: 0 },
  supplier: { type: 'string', required: true },
  expirationDate: { type: 'string', nullable: true }
}, 'Ítem de inventario'));

// --- CITAS ---
app.use('/api/appointments', createCrudRouter('appointment', {
  patientName: { type: 'string', required: true },
  doctorName: { type: 'string', required: true },
  specialty: { type: 'string', required: true },
  date: { type: 'string', required: true },
  time: { type: 'string', required: true },
  phone: { type: 'string', required: true },
  fee: { type: 'float', min: 0 },
  status: { type: 'string', enum: ['Confirmada', 'En Espera', 'Completada', 'Cancelada'] }
}, 'Cita'));

// --- FACTURACIÓN ---
app.use('/api/invoices', createCrudRouter('invoice', {
  patientName: { type: 'string', required: true },
  concept: { type: 'string', required: true },
  amount: { type: 'float', required: true, min: 0 },
  date: { type: 'string', required: true },
  status: { type: 'string', enum: ['Pagada', 'Pendiente', 'Anulada'] }
}, 'Factura'));

// --- Ruta no encontrada ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Manejador global de errores (Express 5 captura también los errores async) ---
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de MediFlow corriendo en http://localhost:${PORT}`);
});
