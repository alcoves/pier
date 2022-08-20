import db from '../config/db'

export async function createPod(req, res) {
  const pod = await db.pod.create({
    data: {
      users: {
        create: [
          {
            role: 'OWNER',
            userId: req.user.id,
          },
        ],
      },
    },
  })

  return res.json({ pod })
}

export async function getPod(req, res) {
  const pod = await db.pod.findUnique({
    where: {
      id: req.params.podId,
    },
    include: {
      users: true,
      videos: true,
    },
  })

  const userIds = pod?.users.map(({ userId }) => {
    return userId
  })

  if (userIds?.includes(req.user.id)) {
    return res.json({ pod })
  }

  return res.sendStatus(400)
}

export async function listPods(req, res) {
  const pods = await db.pod.findMany({
    where: {
      users: {
        some: {
          userId: req.user.id,
        },
      },
    },
  })

  return res.json({ pods })
}

export async function updatePod(req, res) {
  const { podId } = req.params

  const { count } = await db.pod.updateMany({
    where: {
      id: podId,
      users: {
        some: {
          userId: req.user.id,
          AND: {
            role: 'OWNER',
          },
        },
      },
    },
    data: { ...req.body },
  })

  if (count === 1) {
    // a not so great way to know that the record was updated
    return res.json({ pod: await db.pod.findUnique({ where: { id: podId } }) })
  }

  return res.sendStatus(400)
}

export async function deletePod(req, res) {
  const { podId } = req.params

  const podCheck = await db.pod.findMany({
    where: {
      id: podId,
      users: {
        some: {
          userId: req.user.id,
          AND: {
            role: 'OWNER',
          },
        },
      },
    },
  })

  if (!podCheck.length) return res.sendStatus(400)

  await db.pod.delete({
    where: { id: podId },
    include: {
      users: true,
      videos: true,
    },
  })

  return res.sendStatus(200)
}

// video controllers

export async function addPodVideos(req, res) {
  const { podId } = req.params
  const { ids: videoIds } = req.body
  const mappedIds = videoIds.map(id => {
    return { id }
  })

  // TODO :: enforce that pod isSharable
  // TODO :: enforce that user owns the content

  await db.pod.update({
    where: { id: podId },
    data: {
      videos: {
        connect: mappedIds,
      },
    },
  })

  return res.sendStatus(200)
}

export async function removePodVideos(req, res) {
  const { podId } = req.params
  const { ids: videoIds } = req.body
  const mappedIds = videoIds.map(id => {
    return { id }
  })

  // TODO :: enforce that user owns the content

  await db.pod.update({
    where: { id: podId },
    data: {
      videos: {
        disconnect: mappedIds,
      },
    },
  })

  return res.sendStatus(200)
}

// user controllers
