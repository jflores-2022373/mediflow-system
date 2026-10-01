// Configuración global del frontend
export const API_URL = 'http://localhost:4000/api';

// Debe coincidir con GOOGLE_CLIENT_ID del backend (.env)
export const GOOGLE_CLIENT_ID = '856400933592-9f2uq5s5km590uuh5g7u7udp9sp3o3ab.apps.googleusercontent.com';

// Fecha de hoy en formato YYYY-MM-DD según la hora local (no UTC)
export const todayLocal = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

// Extrae el mensaje de error enviado por el backend
export const apiErrorMessage = (err: any, fallback: string): string =>
  err?.error?.error || (err?.status === 0 ? 'No se pudo conectar con el servidor. Verifica que el backend esté encendido (cd backend && pnpm dev).' : fallback);