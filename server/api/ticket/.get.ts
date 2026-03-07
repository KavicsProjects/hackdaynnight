export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { email: true }
    })

    if (!currentUser) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const userEmail = currentUser.email.toLowerCase()

    const tickets = await prisma.ticket.findMany({
        where: {
            OR: [
                { userId: auth.userId },
                { allowedEmails: { isEmpty: true } },
                { allowedEmails: { has: userEmail } }
            ]
        },
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
        },
        orderBy: { createdAt: 'desc' }
    });
    return {
        ticket: tickets
    }
})