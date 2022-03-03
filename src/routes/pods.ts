import express from 'express'
import { auth } from '../middlewares/auth'
import {
  deletePod,
  updatePod,
  createPod,
  getPod,
  listPods,
  listVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  createVideoUpload,
  completeVideoUpload,
} from '../controllers/pods'

const router = express.Router()

router.get('/', auth, listPods)
router.post('/', auth, createPod)

router.get('/:podId', auth, getPod)
router.patch('/:podId', auth, updatePod)
router.delete('/:podId', auth, deletePod)

router.get('/:podId/videos', auth, listVideos)
router.post('/:podId/videos', auth, createVideo)
router.patch('/:podId/videos/:videoId', auth, updateVideo)
router.delete('/:podId/videos/:videoId', auth, deleteVideo)

router.post('/:podId/video/:videoId/upload', auth, createVideoUpload)
router.patch('/:podId/video/:videoId/upload', auth, completeVideoUpload)

export default router
