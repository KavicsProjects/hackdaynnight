export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const body = await readBody(event)

    if (!body.title || !body.description || body.amount === undefined || !body.requesteeId) {
        setResponseStatus(event, 400)
        return { error: 'Missing title, description, amount, or requesteeId' }
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
        setResponseStatus(event, 400)
        return { error: 'Amount must be a positive number' }
    }

    if (auth.userId === body.requesteeId) {
        setResponseStatus(event, 400)
        return { error: 'Cannot request money from yourself' }
    }

    const requestee = await prisma.user.findUnique({
        where: { id: body.requesteeId },
        select: { id: true }
    })

    if (!requestee) {
        setResponseStatus(event, 404)
        return { error: 'Requestee not found' }
    }

    const moneyRequest = await prisma.moneyRequest.create({
        data: {
            title: body.title,
            description: body.description,
            amount: body.amount,
            requester: { connect: { id: auth.userId } },
            requestee: { connect: { id: body.requesteeId } }
        },
        include: {
            requester: { select: { id: true, name: true, email: true, profilePicture: true } },
            requestee: { select: { id: true, name: true, email: true, profilePicture: true } }
        }
    })

    return { moneyRequest }
})
