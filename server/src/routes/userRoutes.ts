import express from 'express'

const router = express.Router();

import registerUser from './auth.routes.ts'
router.use('/api',registerUser)

import accountRoute  from './account.routes.ts'
router.use('/acc',accountRoute)

import roleRoute from './role.routes.ts'
router.use('/role', roleRoute)


export default router;