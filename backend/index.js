import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- PACIENTES ---
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { id: 'desc' } });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const newPatient = await prisma.patient.create({
      data: {
        name: req.body.name,
        age: Number(req.body.age),
        phone: req.body.phone,
        email: req.body.email || '',
        gender: req.body.gender,
        blood: req.body.blood || 'O+',
        status: req.body.status || 'Activo'
      }
    });
    res.status(201).json(newPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.patient.update({
      where: { id: Number(id) },
      data: {
        name: req.body.name,
        age: Number(req.body.age),
        phone: req.body.phone,
        email: req.body.email,
        gender: req.body.gender,
        blood: req.body.blood,
        status: req.body.status
      }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await prisma.patient.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
});

// --- INVENTARIO ---
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({ orderBy: { id: 'desc' } });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const newItem = await prisma.inventoryItem.create({ data: req.body });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ítem de inventario' });
  }
});

// --- CITAS ---
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({ orderBy: { id: 'desc' } });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const newAppt = await prisma.appointment.create({ data: req.body });
    res.status(201).json(newAppt);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

// --- FACTURACIÓN ---
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({ orderBy: { id: 'desc' } });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = await prisma.invoice.create({ data: req.body });
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear factura' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor profesional de MediFlow corriendo en el puerto ${PORT}`);
});