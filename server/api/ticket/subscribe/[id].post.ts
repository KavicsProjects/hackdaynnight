export default defineEventHandler(async (event) => {
    //TODO átírni GET req-re és -> userId: event.context.auth.userId,
    
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    const resp = await prisma.userTicketConnect.create({
        data:{
            user: {
                connect: {
                    id: body.userId
                }
            },
            ticket: {
                connect: {
                    id: id
                }
            }
        }
    })
    return {
        ticket: resp
    }
})