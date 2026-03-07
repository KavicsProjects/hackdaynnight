export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id')

    const moneyRequest = await prisma.moneyRequest.findUnique({
        where: { id }
    })

    if (!moneyRequest) {
        setResponseStatus(event, 404)
        return { error: 'Money request not found' }
    }

    if (moneyRequest.requesteeId !== auth.userId) {
        setResponseStatus(event, 403)
        return { error: 'Only the requestee can accept this request' }
    }

    if (moneyRequest.status !== 'pending') {
        setResponseStatus(event, 400)
        return { error: 'This request has already been resolved' }
    }

    const result = await prisma.$transaction(async (tx) => {
        const payer = await tx.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, balance: true }
        })

        if (!payer) {
            return { payerNotFound: true }
        }

        if (payer.balance < moneyRequest.amount) {
            return { insufficientBalance: true }
        }

        await tx.user.update({
            where: { id: auth.userId },
            data: { balance: { decrement: moneyRequest.amount } }
        })

        await tx.user.update({
            where: { id: moneyRequest.requesterId },
            data: { balance: { increment: moneyRequest.amount } }
        })

        await tx.transaction.create({
            data: {
                amount: moneyRequest.amount,
                user: { connect: { id: auth.userId } },
                receiver: { connect: { id: moneyRequest.requesterId } }
            }
        })

        const updated = await tx.moneyRequest.update({
            where: { id },
            data: { status: 'accepted' }
        })

        return { updated }
    })

    if ('payerNotFound' in result) {
        setResponseStatus(event, 404)
        return { error: 'Payer not found' }
    }

    if ('insufficientBalance' in result) {
        setResponseStatus(event, 400)
        return { error: 'Insufficient balance' }
    }

    return { moneyRequest: result.updated }
})
