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

    const resp = await prisma.userTicketConnect.update({
        where: { userId_ticketId: { userId: auth.userId, ticketId: id } },
        data: { userMarkedComplete: false }
    })
    return { ticket: resp }
})