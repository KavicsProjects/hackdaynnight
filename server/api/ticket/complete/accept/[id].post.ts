export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
        setResponseStatus(event, 400)
        return { error: 'Missing ticketId' }
    }

    const body = await readBody(event)
    const completorId: string | undefined = body?.completorId

    if (!completorId) {
        setResponseStatus(event, 400)
        return { error: 'Missing completorId' }
    }

    const ticketResp = await prisma.ticket.findUnique({
        where: { id: id },
        select: { reward: true, userId: true }
    })

    if (ticketResp === null) {
        setResponseStatus(event, 404)
        return { error: 'Ticket not found' }
    }

    if (ticketResp.userId !== auth.userId) {
        setResponseStatus(event, 403)
        return { error: 'Only the task creator can accept completions' }
    }

    const result = await prisma.$transaction(async (tx) => {
        const existingConnect = await tx.userTicketConnect.findUnique({
            where: { userId_ticketId: { userId: completorId, ticketId: id } },
            select: { acceptedByAuthor: true, userMarkedComplete: true }
        })

        if (existingConnect === null) {
            return { notFound: true }
        }

        if (!existingConnect.userMarkedComplete) {
            return { notMarkedComplete: true }
        }

        const alreadyAccepted = existingConnect.acceptedByAuthor

        const ticketConnect = await tx.userTicketConnect.update({
            where: { userId_ticketId: { userId: completorId, ticketId: id } },
            data: { acceptedByAuthor: true }
        })

        if (ticketResp.reward !== 0 && !alreadyAccepted) {
            const userUpdate = await tx.user.update({
                where: { id: completorId },
                data: { balance: { increment: ticketResp.reward } }
            })

            const transaction = await tx.transaction.create({
                data: {
                    amount: ticketResp.reward,
                    user: { connect: { id: ticketResp.userId } },
                    receiver: { connect: { id: completorId } }
                }
            })

            return { ticketConnect, userUpdate, transaction }
        }

        return { ticketConnect }
    })

    if ('notFound' in result) {
        setResponseStatus(event, 404)
        return { error: 'Ticket connection not found' }
    }

    if ('notMarkedComplete' in result) {
        setResponseStatus(event, 400)
        return { error: 'Completor has not marked this task as complete' }
    }

    return { response: result }
})