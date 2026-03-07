export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id');

    const currentUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
    })

    if (!currentUser) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const userEmail = currentUser.email.toLowerCase()

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, profilePicture: true } },
            userTicketConnects: {
                select: {
                    userId: true,
                    userMarkedComplete: true,
                    acceptedByAuthor: true,
                    user: { select: { id: true, name: true, email: true } }
                }
            }
        }
    });

    if (!ticket) {
        setResponseStatus(event, 404)
        return { error: 'Ticket not found' }
    }

    const hasAccess = ticket.userId === auth.userId
        || ticket.allowedEmails.length === 0
        || ticket.allowedEmails.includes(userEmail)

    if (!hasAccess) {
        setResponseStatus(event, 403)
        return { error: 'Access denied' }
    }

    return { ticket }
})