import express from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';

const router = express.Router();

// Rutas para el inventario de farmacia
router.get('/', getProducts);
router.post('/', createProduct);

export default router;