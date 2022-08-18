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
  const pods = await db.pod.findMany({
    where: {
      id: req.params.podId,
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

  if (!pods.length) return res.sendStatus(404)
  return res.json({ pod: pods[0] })
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

// user controllers
