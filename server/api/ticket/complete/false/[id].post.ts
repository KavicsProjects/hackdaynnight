export default defineEventHandler(async (event) => {
    //TODO átírni GET req-re és -> userId: event.context.auth.userId,

    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!body.userId || !id) {
        setResponseStatus(event, 400);
        return {
            error: "Missing userId or ticketId"
        }
    }


    const resp = await prisma.userTicketConnect.update({
        where: {
            userId_ticketId: {
                userId: body.userId,
                ticketId: id
            }
        },
        data: {
            userMarkedComplete: false
        }
    })
    return {
        ticket: resp
    }
})