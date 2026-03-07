export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id')

    const resp = await prisma.userTicketConnect.create({
        data: {
            user: { connect: { id: auth.userId } },
            ticket: { connect: { id: id } }
        }
    })
    return { ticket: resp }
})