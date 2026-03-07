export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const [sent, received] = await Promise.all([
        prisma.moneyRequest.findMany({
            where: { requesterId: auth.userId },
            include: {
                requestee: { select: { id: true, name: true, email: true, profilePicture: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.moneyRequest.findMany({
            where: { requesteeId: auth.userId },
            include: {
                requester: { select: { id: true, name: true, email: true, profilePicture: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    ])

    return { sent, received }
})
