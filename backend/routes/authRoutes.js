import express from 'express';
import prisma from '../lib/prisma.js';
import { hashPassword, verifyPassword, signToken, verifyGoogleCredential } from '../lib/auth.js';

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const sessionResponse = (user) => ({
  token: signToken(user),
  user: { id: user.id, email: user.email, name: user.name }
});

// Acceso con correo: inicia sesión si la cuenta existe o la registra si es nueva
router.post('/email', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Ingrese un correo electrónico válido' });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (!existing.passwordHash) {
      return res.status(401).json({ error: 'Esta cuenta fue creada con Google. Use "Continuar con Google".' });
    }
    if (!(await verifyPassword(password, existing.passwordHash))) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    return res.json(sessionResponse(existing));
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: email.split('@')[0],
      passwordHash: await hashPassword(password)
    }
  });
  res.status(201).json(sessionResponse(user));
});

// Acceso con Google: valida el ID token y crea/actualiza el usuario
router.post('/google', async (req, res) => {
  const credential = req.body?.credential;
  if (!credential) {
    return res.status(400).json({ error: 'Falta la credencial de Google' });
  }

  const profile = await verifyGoogleCredential(credential);
  if (!profile) {
    return res.status(401).json({ error: 'No se pudo verificar la cuenta de Google' });
  }

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: { googleId: profile.googleId, name: profile.name ?? undefined },
    create: { email: profile.email, name: profile.name, googleId: profile.googleId }
  });

  res.json(sessionResponse(user));
});

export default router;
