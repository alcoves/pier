import express from 'express'
import { get } from '../controllers/jobs'
// import { tidalAuth } from '../middlewares/auth'

const router = express.Router()

router.get('/', get)

export default router