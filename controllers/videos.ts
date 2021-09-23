import mongoose from 'mongoose'
import { Video } from '../lib/models'
import { createAsset, deleteAsset } from '../lib/tidal'
import { Request, Response } from 'express'
import s3, { deleteFolder, getSignedURL } from '../lib/s3'

interface CreateVideoInput {
  title: string
}

export async function listVideos(req: Request, res: Response) {
  const videos = await Video.find({
    pod: new mongoose.Types.ObjectId(req.params.podId),
  }).populate("owner").sort('-createdAt')
  return res.json({ data: videos  })
}

export async function getVideo(req: Request, res: Response) {
  const video = await Video.findOne({
    _id:  new mongoose.Types.ObjectId(req.params.videoId),
  })
  if (video) return res.json({ data: video })
  return res.sendStatus(404)
}

export async function createVideo(req: Request, res: Response) {
  const createVideoInput: CreateVideoInput = req.body
  const signedUrl = await getSignedURL({
    Bucket: 'cdn.bken.io',
    Key: `source/${req.params.videoId}/original`
  })

  const asset = await createAsset(signedUrl)
  console.log("Tidal Asset", asset)

  const video = await Video.findOneAndUpdate({
    _id: new mongoose.Types.ObjectId(req.params.videoId),
  }, {
    _id: new mongoose.Types.ObjectId(req.params.videoId),
    title: createVideoInput?.title || "New Upload",
    tidalAssetId: asset._id,
    pod: req.params.podId,
    owner: req.userId,
  }, {
    new: true,
    upsert: true
  })

  return res.json(video)
}

export async function createUploadUrl(req: Request, res: Response) {
  const videoId = new mongoose.Types.ObjectId()
  const signedUploadUrl = await s3.getSignedUrlPromise('putObject', {
    Bucket: 'cdn.bken.io',
    Key: `source/${videoId}/original`
  })
  return res.json({ data: { _id: videoId, url: signedUploadUrl } })
}

export async function deleteVideo(req: Request, res: Response) {
  const video = await Video.findOne({
    _id: req.params.videoId,
    owner: req.userId
  })

  // Double check that video._id is not null
  // If null, entire s3 prefix could be wiped
  // await deleteAsset()

  if (video && video._id.toString() === req.params.videoId) {
    await deleteFolder({
      Bucket: 'cdn.bken.io',
      Prefix: `source/${video._id}`,
    })
    await Video.findByIdAndDelete(video._id)
    return res.sendStatus(200)
  }
  return res.sendStatus(403)
}
