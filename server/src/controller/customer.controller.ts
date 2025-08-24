import customer_service from "../services/customer.service";

const controller = {
  addCustomer: async (req : any, res : any) => {
    try {
      const newCustomer = await customer_service.add(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  },
  getAllCustomers: async (req : any, res : any) => {
    try {
      const customers = await customer_service.getAll();
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  },
  updateCustomer: async (req : any, res : any) => {
    try {
      const customerId = parseInt(req.params.id);
      const updatedCustomer = await customer_service.update(customerId, req.body);
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  },
  getCustomerById: async (req : any, res : any) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await customer_service.getById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }
};

export default controller;
