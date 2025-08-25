import { Router } from "express";
import controller from '../controller/customer.controller.ts'

const router = Router();

router.post('/add-customer', controller.addCustomer);
router.get('/get-customers', controller.getAllCustomers);
router.put('/update-customer/:id', controller.updateCustomer);
router.get('/get-customer/:id', controller.getCustomerById);
router.post('/add-point/:id',controller.addCustomerPoint)

export default router;
