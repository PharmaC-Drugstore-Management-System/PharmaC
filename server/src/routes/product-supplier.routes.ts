import { Router } from "express";
import prisma from "../utils/prisma.utils";

const router = Router();

// Get products with their suppliers
router.get('/products-with-suppliers', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        product_suppliers: {
          include: {
            supplier: true
          },
          where: {
            is_active: true
          }
        }
      },
      orderBy: {
        product_name: 'asc'
      }
    });
    
    // Transform data for frontend
    const transformedProducts = products.map(product => ({
      id: product.product_id,
      name: product.product_name,
      brand: product.brand,
      barcode: product.barcode,
      friendlyid: product.friendlyid,
      image: product.image || '💊',
      unit: product.unit,
      producttype: product.producttype,
      iscontrolled: product.iscontrolled,
      suppliers: product.product_suppliers.map((ps: any) => ({
        supplier_id: ps.supplier.supplier_id,
        supplier_name: ps.supplier.name,
        price: ps.cost, // แปลง cost เป็น price สำหรับ frontend
        is_active: ps.is_active
      }))
    }));
    
    res.json(transformedProducts);
  } catch (error: any) {
    console.error("Error fetching products with suppliers:", error.message);
    res.status(500).json({ error: 'Failed to fetch products with suppliers' });
  }
});

// Create product-supplier relationship
router.post('/product-supplier', async (req, res) => {
  try {
    const { product_id, supplier_id, cost } = req.body;
    
    if (!product_id || !supplier_id) {
      return res.status(400).json({ error: 'Product ID and Supplier ID are required' });
    }

    // Use upsert to handle both create and update cases
    const productSupplier = await prisma.product_supplier.upsert({
      where: {
        product_id_supplier_id: {
          product_id: parseInt(product_id),
          supplier_id: parseInt(supplier_id)
        }
      },
      update: {
        cost: parseFloat(cost) || 0,
        is_active: true,
        updated_at: new Date()
      },
      create: {
        product_id: parseInt(product_id),
        supplier_id: parseInt(supplier_id),
        cost: parseFloat(cost) || 0,
        is_active: true
      }
    });
    res.json(productSupplier);
  } catch (error: any) {
    console.error("Error creating product-supplier relationship:", error.message);
    res.status(500).json({ error: 'Failed to create product-supplier relationship' });
  }
});

// Update product-supplier cost
router.put('/product-supplier/:productId/:supplierId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const supplierId = parseInt(req.params.supplierId);
    const { cost, is_active } = req.body;
    
    const updated = await prisma.product_supplier.update({
      where: { 
        product_id_supplier_id: {
          product_id: productId,
          supplier_id: supplierId
        }
      },
      data: {
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date()
      }
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error("Error updating product-supplier relationship:", error.message);
    res.status(500).json({ error: 'Failed to update product-supplier relationship' });
  }
});

// Delete product-supplier relationship (soft delete)
router.delete('/product-supplier/:productId/:supplierId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const supplierId = parseInt(req.params.supplierId);
    
    const updated = await prisma.product_supplier.update({
      where: { 
        product_id_supplier_id: {
          product_id: productId,
          supplier_id: supplierId
        }
      },
      data: { 
        is_active: false,
        updated_at: new Date()
      }
    });
    
    res.json({ message: 'Product-supplier relationship deactivated', data: updated });
  } catch (error: any) {
    console.error("Error deleting product-supplier relationship:", error.message);
    res.status(500).json({ error: 'Failed to delete product-supplier relationship' });
  }
});

export default router;
