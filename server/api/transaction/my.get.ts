export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const transactions = await prisma.transaction.findMany({
        where: {
            OR: [
                { userId: auth.userId },
                { receiverId: auth.userId }
            ]
        },
        include: {
            user: { select: { id: true, name: true, email: true, profilePicture: true } },
            receiver: { select: { id: true, name: true, email: true, profilePicture: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return { transactions }
})
