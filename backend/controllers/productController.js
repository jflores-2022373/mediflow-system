import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los productos del inventario
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al obtener los productos del inventario'
    });
  }
};

// Crear un nuevo producto en la farmacia
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    // Validación básica profesional
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Los campos name, price y stock son obligatorios'
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock, 10)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al registrar el producto'
    });
  }
};