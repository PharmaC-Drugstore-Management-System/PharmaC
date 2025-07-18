import express from 'express'

const router = express.Router();

import registerUser from './auth.routes.ts'
router.use('/api',registerUser)

import accountRoute  from './account.routes.ts'
router.use('/acc',accountRoute)

import roleRoute from './role.routes.ts'
router.use('/role', roleRoute)

import inventoryRoute from './medicine.routes.ts'
router.use('/inventory',inventoryRoute)


export default router;