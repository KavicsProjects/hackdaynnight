export default defineEventHandler(async (event) => {
    
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const ticket = await prisma.ticket.update({
        where: {
            id: id
        },
        data: {
            ...body
        }
    });
    return {
        ticket: ticket
    }
})