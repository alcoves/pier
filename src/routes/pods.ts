import express from 'express'
import {
  getPod,
  listPods,
  createPod,
  updatePod,
  deletePod,
  addPodVideos,
  removePodVideos,
  // addPodUsers,
  // addPodVideos,
  // listPodVideos,
  // updatePodUsers,
  // removePodUsers,
  // removePodVideos,
} from '../controllers/pods'
import { auth } from '../middlewares/auth'

const router = express.Router()

router.get('/', auth, listPods)
router.post('/', auth, createPod)
router.get('/:podId', auth, getPod)
router.patch('/:podId', auth, updatePod)
router.delete('/:podId', auth, deletePod)

// video routes

router.post('/:podId/videos', auth, addPodVideos)
router.delete('/:podId/videos', auth, removePodVideos)

// // user routes

// router.post('/:podId/users', addPodUsers)
// // takes userIds and roles
// router.patch('/:podId/users', updatePodUsers)
// // takes role
// router.delete('/:podId/users', removePodUsers)
// // takes userIds, checks that the user requesting is owner

export default router
