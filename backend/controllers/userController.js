import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los usuarios / personal
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
        // Omitimos la contraseña por seguridad profesional
      }
    });
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener los usuarios'
    });
  }
};

// Registrar un nuevo usuario / personal médico o administrativo
export const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'El correo y la contraseña son obligatorios'
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password // Nota: En producción profesional aquí aplicaríamos bcrypt para el hash
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: newUser
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el usuario'
    });
  }
};