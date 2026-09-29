import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 horas

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }
  return secret;
};

// --- CONTRASEÑAS (scrypt con sal aleatoria) ---
export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
};

export const verifyPassword = async (password, stored) => {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, salt, expected.length);
  return crypto.timingSafeEqual(expected, actual);
};

// --- TOKENS DE SESIÓN (JWT HS256) ---
const base64url = (input) => Buffer.from(input).toString('base64url');

const sign = (data) =>
  crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');

export const signToken = (user) => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  }));
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
};

export const verifyToken = (token) => {
  const [header, payload, signature] = (token || '').split('.');
  if (!header || !payload || !signature) return null;

  const expected = Buffer.from(sign(`${header}.${payload}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
};

// Middleware: exige un token válido en "Authorization: Bearer <token>"
export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  req.user = payload;
  next();
};

// --- GOOGLE ---
// Valida el ID token de Google Identity Services contra los servidores de Google
export const verifyGoogleCredential = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Falta la variable de entorno GOOGLE_CLIENT_ID');
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!response.ok) return null;

  const data = await response.json();
  const validIssuer = data.iss === 'accounts.google.com' || data.iss === 'https://accounts.google.com';
  const verifiedEmail = data.email_verified === true || data.email_verified === 'true';

  if (data.aud !== clientId || !validIssuer || !verifiedEmail || !data.email) {
    return null;
  }

  return { googleId: data.sub, email: data.email, name: data.name || null };
};
