import express from 'express'

const router = express.Router();

import authUser from './auth.routes.ts'
router.use('/auth',authUser)

import accountRoute  from './account.routes.ts'
router.use('/acc',accountRoute)

import roleRoute from './role.routes.ts'
router.use('/role', roleRoute)

import inventoryRoute from './medicine.routes.ts'
router.use('/inventory',inventoryRoute)

import forecastRoute from './forecast.routes.ts'
router.use('/arima',forecastRoute)


export default router;