import db from '../../config/db'

export const messageResolvers = {
  Query: {
    getChannelMessages: (_, { input: { channelId, before } }, { user }) => {
      if (!user) throw new Error('Requires auth')
      const where: any = { channelId }
      if (before) {
        where.createdAt = {
          lt: new Date(before),
        }
      }

      return db.message.findMany({
        take: 20,
        where,
        include: { user: true },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      })
    },
  },
  Mutation: {
    createMessage: async (_, { input }, { user, pubsub }) => {
      if (!user) throw new Error('Requires auth')
      // TODO :: check that the user has the rights to add messages to channel
      if (!input.content.length) throw new Error('Message contained no content')

      const message = await db.message.create({
        data: {
          userId: user.id,
          content: input.content,
          channelId: input.channel,
        },
        include: {
          user: true,
        },
      })

      pubsub.publish(input.channel, { channelMessages: [message] })
      return message
    },
  },
  Subscription: {
    channelMessages: {
      subscribe: (_, { channelId }, { pubsub }) => {
        return pubsub.asyncIterator(channelId)
      },
    },
  },
}