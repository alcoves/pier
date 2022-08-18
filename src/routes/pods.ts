import express from 'express'
import {
  getPod,
  listPods,
  createPod,
  updatePod,
  deletePod,
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

// router.get('/:podId/videos', listPodVideos)
// // gets the videos on a pod

// router.post('/:podId/videos', addPodVideos)
// // takes videoIds, checks that the requesting user owns the videos and that pod isShareable otherwise

// router.delete('/:podId/videos', removePodVideos)
// // takes videoIds, checks that the users own the videos, bypasses isSharable

// // user routes

// router.post('/:podId/users', addPodUsers)
// // takes userIds and roles
// router.patch('/:podId/users', updatePodUsers)
// // takes role
// router.delete('/:podId/users', removePodUsers)
// // takes userIds, checks that the user requesting is owner

export default router
