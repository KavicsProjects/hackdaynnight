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

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        select: { allowedEmails: true, userId: true }
    })

    if (!ticket) {
        setResponseStatus(event, 404)
        return { error: 'Ticket not found' }
    }

    if (ticket.userId === auth.userId) {
        setResponseStatus(event, 400)
        return { error: 'Task creators cannot apply to their own tasks' }
    }

    if (ticket.allowedEmails.length > 0) {
        const currentUser = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: { email: true }
        })

        if (!currentUser || !ticket.allowedEmails.includes(currentUser.email.toLowerCase())) {
            setResponseStatus(event, 403)
            return { error: 'You are not allowed to apply to this task' }
        }
    }

    const existing = await prisma.userTicketConnect.findUnique({
        where: { userId_ticketId: { userId: auth.userId, ticketId: id } }
    })

    if (existing) {
        setResponseStatus(event, 409)
        return { error: 'Already applied to this task' }
    }

    const resp = await prisma.userTicketConnect.create({
        data: {
            user: { connect: { id: auth.userId } },
            ticket: { connect: { id: id } }
        }
    })
    return { ticket: resp }
})