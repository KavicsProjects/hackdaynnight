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
        return { error: 'Only the requestee can decline this request' }
    }

    if (moneyRequest.status !== 'pending') {
        setResponseStatus(event, 400)
        return { error: 'This request has already been resolved' }
    }

    const updated = await prisma.moneyRequest.update({
        where: { id },
        data: { status: 'declined' }
    })

    return { moneyRequest: updated }
})
