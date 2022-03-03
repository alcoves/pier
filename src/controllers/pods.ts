import path from 'path'
import db from '../config/db'
import { Video } from '@prisma/client'
import s3, { defaultBucket, deleteFolder } from '../config/s3'

export async function listPods(req, res) {
  const memberships = await db.membership.findMany({
    include: { pod: true },
    where: { userId: req.user.id },
  })
  return res.json({
    payload: memberships.map(m => m.pod) || [],
  })
}

export async function createPod(req, res) {
  // TODO :: Replace with Joi
  if (!req.body.name) return res.sendStatus(400)
  const pod = await db.pod.create({
    data: {
      name: req.body.name,
      memberships: { create: [{ role: 'OWNER', userId: req.user.id }] },
    },
  })
  return res.json({ id: pod.id })
}

export async function getPod(req, res) {
  const membership = await db.membership.findFirst({
    where: { userId: req.user.id, podId: req.params.podId },
  })
  if (!membership) return res.sendStatus(400)

  const pod = await db.pod.findFirst({ where: { id: req.params.podId } })
  return res.json({ payload: pod })
}

// TODO :: Implement
export async function updatePod(req, res) {
  const membership = await db.membership.findFirst({
    where: { userId: req.user.id, podId: req.params.podId },
  })
  if (!membership) return res.sendStatus(400)

  return res.sendStatus(200)
}

export async function deletePod(req, res) {
  const { podId } = req.params

  const membership = await db.membership.findFirst({
    where: { userId: req.user.id, podId },
  })
  if (!membership) return res.sendStatus(400)

  await db.pod.delete({ where: { id: podId } })
  return res.sendStatus(200)
}

export async function listVideos(req, res) {
  const { podId } = req.params

  const membership = await db.membership.findFirst({ where: { podId } })
  if (!membership) return res.sendStatus(403)

  const videos = await db.video.findMany({ where: { podId } })
  if (!videos.length) return res.sendStatus(400)
  return res.json({ payload: videos })
}

export async function createVideo(req, res) {
  const { title } = req.body
  const { podId } = req.params
  const { id: userId } = req.user

  const podMembership = await db.membership.findFirst({
    where: { userId, podId },
  })
  if (!podMembership) return res.sendStatus(403)

  const video = await db.video.create({
    data: {
      podId,
      userId,
      title: path.parse(title).name,
    },
  })
  return res.json({
    payload: video,
  })
}

export async function deleteVideo(req, res) {
  const { id: userId } = req.user
  const { podId, videoId } = req.params

  // TODO :: Replace with Joi
  if (!videoId || !podId) return res.sendStatus(400)

  const membership = await db.membership.findFirst({
    where: { userId, podId },
  })
  if (!membership) return res.sendStatus(403)

  const video = await db.video.findFirst({
    where: { id: videoId },
    include: { pod: true },
  })
  if (!video) return res.sendStatus(400)

  // TODO :: Add RBAC
  if (video.pod.id === podId) {
    // The pod that owns the video is requesting deletion
    // By deleting the video record, cascading video shares are also deleted
    await db.video.delete({ where: { id: video.id } })
    if (video.id.length > 0) {
      await deleteFolder({ Bucket: defaultBucket, Prefix: `v/${video.id}` })
    }
    return res.sendStatus(200)
  } else {
    // Delete single video share
    await db.videoShare.delete({
      where: { videoId, podId },
    })
    return res.sendStatus(200)
  }
}

// TODO :: Implement
export async function updateVideo(req, res) {
  return res.sendStatus(200)
}

export async function createVideoUpload(req, res) {
  const { id: userId } = req.user
  const { chunks, type } = req.body
  const { podId, videoId } = req.params

  const podMembership = await db.membership.findFirst({
    where: { userId, podId },
    include: { pod: true },
  })
  if (!podMembership || !podMembership?.pod?.id) return res.sendStatus(403)

  const video = await db.video.findFirst({
    where: { id: videoId },
    include: { user: true },
  })
  if (!video) return res.sendStatus(400)

  const { UploadId, Key } = await s3
    .createMultipartUpload({
      ContentType: type,
      Bucket: defaultBucket,
      Key: `v/${video.id}/original`,
    })
    .promise()
  const urls: string[] = []
  for (let i = 0; i < chunks; i++) {
    urls.push(
      s3.getSignedUrl('uploadPart', {
        Key,
        UploadId,
        Expires: 43200,
        PartNumber: i + 1,
        Bucket: defaultBucket,
      })
    )
  }

  return res.json({
    payload: {
      video,
      upload: {
        urls,
        key: Key,
        uploadId: UploadId,
      },
    },
  })
}

export async function completeVideoUpload(req, res) {
  // const { videoId } = req.params
  // const { key, uploadId } = req.body
  // try {
  //   const userOwnsVideo = await db.video.findFirst({
  //     where: { id: videoId, userId: req.params.id },
  //   })
  //   if (!userOwnsVideo) return res.sendStatus(403)
  //   // TODO :: Make this work for greater than 1000 part uploads
  //   const { Parts } = await s3
  //     .listParts({
  //       Key: key,
  //       UploadId: uploadId,
  //       Bucket: defaultBucket,
  //     })
  //     .promise()
  //   const mappedParts: CompletedPart[] =
  //     Parts?.map(({ ETag, PartNumber }) => {
  //       return { ETag, PartNumber } as CompletedPart
  //     }) || []
  //   await s3
  //     .completeMultipartUpload({
  //       Key: key,
  //       UploadId: uploadId,
  //       Bucket: defaultBucket,
  //       MultipartUpload: { Parts: mappedParts },
  //     })
  //     .promise()
  //   const { ContentLength = 0 } = await s3
  //     .headObject({
  //       Bucket: defaultBucket,
  //       Key: `v/${videoId}/original`,
  //     })
  //     .promise()
  //   const video = await db.video.update({
  //     where: { id: videoId },
  //     data: {
  //       size: Math.round(ContentLength / 1048576),
  //     },
  //   })
  //   // Ask Tidal to generate metadata. This is an asyncronous process
  //   // After this. Tidal will respond via webhook as a POST /hooks/tidal/videos/:videoId
  //   // This webhook will contain the metadata. When the job is seen, other jobs (thumbnailing and transcoding) will be dispatched
  //   await dispatchJob('metadata', {
  //     entityId: video.id,
  //     input: {
  //       key,
  //       bucket: defaultBucket,
  //     },
  //   })
  //   return res.json({
  //     status: 'success',
  //     payload: video,
  //   })
  // } catch (error) {
  //   await db.video.update({
  //     where: { id: videoId },
  //     data: { status: 'ERROR' },
  //   })
  // }
}
