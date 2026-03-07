export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const body = await readBody(event)

    if (!body.receiverId || body.amount === undefined) {
        setResponseStatus(event, 400)
        return { error: 'Missing receiverId or amount' }
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
        setResponseStatus(event, 400)
        return { error: 'Amount must be a positive number' }
    }

    if (auth.userId === body.receiverId) {
        setResponseStatus(event, 400)
        return { error: 'Sender and receiver must be different users' }
    }

    const result = await prisma.$transaction(async (tx) => {
        const sender = await tx.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, balance: true }
        })

        if (sender === null) {
            return { senderNotFound: true }
        }

        if (sender.balance < body.amount) {
            return { insufficientBalance: true }
        }

        const receiver = await tx.user.findUnique({
            where: { id: body.receiverId },
            select: { id: true }
        })

        if (receiver === null) {
            return { receiverNotFound: true }
        }

        await tx.user.update({
            where: { id: auth.userId },
            data: { balance: { decrement: body.amount } }
        })

        await tx.user.update({
            where: { id: body.receiverId },
            data: { balance: { increment: body.amount } }
        })

        const transaction = await tx.transaction.create({
            data: {
                amount: body.amount,
                user: { connect: { id: auth.userId } },
                receiver: { connect: { id: body.receiverId } }
            }
        })

        return { transaction }
    })

    if ('senderNotFound' in result) {
        setResponseStatus(event, 404)
        return { error: 'Sender not found' }
    }

    if ('insufficientBalance' in result) {
        setResponseStatus(event, 400)
        return { error: 'Insufficient balance' }
    }

    if ('receiverNotFound' in result) {
        setResponseStatus(event, 404)
        return { error: 'Receiver not found' }
    }

    return { response: result }
})
