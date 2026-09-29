import express from 'express';
import prisma from './prisma.js';

// Convierte y valida el cuerpo de la petición según el esquema del recurso.
// Solo se aceptan los campos declarados; cualquier otro campo se ignora.
const parseBody = (body, fields) => {
  const data = {};
  const errors = [];

  for (const [field, rules] of Object.entries(fields)) {
    let value = body?.[field];
    const isEmpty = value === undefined || value === null || value === '';

    if (isEmpty) {
      if (rules.required) errors.push(`El campo "${field}" es obligatorio`);
      else if (rules.nullable) data[field] = null;
      continue;
    }

    if (rules.type === 'int' || rules.type === 'float') {
      value = Number(value);
      if (!Number.isFinite(value) || (rules.type === 'int' && !Number.isInteger(value))) {
        errors.push(`El campo "${field}" debe ser un número${rules.type === 'int' ? ' entero' : ''}`);
        continue;
      }
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`El campo "${field}" debe ser mayor o igual a ${rules.min}`);
        continue;
      }
    } else {
      value = String(value).trim();
      if (rules.required && !value) {
        errors.push(`El campo "${field}" es obligatorio`);
        continue;
      }
    }

    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`El campo "${field}" debe ser uno de: ${rules.enum.join(', ')}`);
      continue;
    }

    data[field] = value;
  }

  return { data, errors };
};

const parseId = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ID inválido' });
    return null;
  }
  return id;
};

const isNotFound = (error) => error?.code === 'P2025';

// Crea un router con GET, POST, PUT y DELETE para un modelo de Prisma
export const createCrudRouter = (modelName, fields, label) => {
  const router = express.Router();
  const model = prisma[modelName];

  router.get('/', async (req, res) => {
    res.json(await model.findMany({ orderBy: { id: 'desc' } }));
  });

  router.post('/', async (req, res) => {
    const { data, errors } = parseBody(req.body, fields);
    if (errors.length) return res.status(400).json({ error: errors.join('. ') });

    res.status(201).json(await model.create({ data }));
  });

  router.put('/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    const { data, errors } = parseBody(req.body, fields);
    if (errors.length) return res.status(400).json({ error: errors.join('. ') });

    try {
      res.json(await model.update({ where: { id }, data }));
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: `${label} no encontrado` });
      throw error;
    }
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req, res);
    if (id === null) return;

    try {
      await model.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      if (isNotFound(error)) return res.status(404).json({ error: `${label} no encontrado` });
      throw error;
    }
  });

  return router;
};
