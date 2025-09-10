import { Router } from "express";
import prisma from "../utils/prisma.utils";

const router = Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error: any) {
    console.error("Error fetching suppliers:", error.message);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const { name, tax_id, address, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: { 
        name, 
        tax_id, 
        address, 
        description 
      }
    });
    
    res.json(supplier);
  } catch (error: any) {
    console.error("Error creating supplier:", error.message);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Get supplier with products
router.get('/:id/products', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    
    const supplier = await prisma.supplier.findUnique({
      where: { supplier_id: supplierId },
      include: {
        product_suppliers: {
          include: {
            product: true
          },
          where: {
            is_active: true
          }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error: any) {
    console.error("Error fetching supplier products:", error.message);
    res.status(500).json({ error: 'Failed to fetch supplier products' });
  }
});

export default router;
