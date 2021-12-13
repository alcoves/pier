import express from 'express'
import { auth } from '../middlewares/auth'
import { patchUser } from '../controllers/users'

const router = express.Router()

router.patch('/:userId', auth, patchUser)

export default router