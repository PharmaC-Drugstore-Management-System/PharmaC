import express from 'express'

const router = express.Router();

import authRoute from './auth.routes.ts'
router.use('/api',authRoute)


import accountRoute  from './account.routes.ts'
router.use('/acc',accountRoute)

import roleRoute from './role.routes.ts'
router.use('/role', roleRoute)

import inventoryRoute from './medicine.routes.ts'
router.use('/inventory',inventoryRoute)

import lotRoute from './lot.routes.ts'
router.use('/lot', lotRoute)

import unitRoute from './unit.routes.ts'
router.use('/unit', unitRoute)

import iscontrolledRoute from './iscontrolled.routes.ts'
router.use('/iscontrolled', iscontrolledRoute)

import typeRoute from './type.routes.ts'
router.use('/type', typeRoute)

import forecastRoute from './forecast.routes.ts'
router.use('/arima',forecastRoute)


export default router;