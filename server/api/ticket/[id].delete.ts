export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id');

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            userTicketConnects: { select: { acceptedByAuthor: true } }
        }
    })

    if (!ticket) {
        setResponseStatus(event, 404)
        return { error: 'Ticket not found' }
    }

    if (ticket.userId !== auth.userId) {
        setResponseStatus(event, 403)
        return { error: 'Only the task creator can delete this task' }
    }

    const acceptedCount = ticket.userTicketConnects.filter(c => c.acceptedByAuthor).length
    const refundAmount = ticket.reward * (ticket.maxFinishers - acceptedCount)

    const result = await prisma.$transaction(async (tx) => {
        await tx.userTicketConnect.deleteMany({ where: { ticketId: id } })

        const deletedTicket = await tx.ticket.delete({ where: { id } })

        if (refundAmount > 0) {
            await tx.user.update({
                where: { id: auth.userId },
                data: { balance: { increment: refundAmount } }
            })
        }

        return { ticket: deletedTicket, refundAmount }
    })

    return result
})