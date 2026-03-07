export default defineEventHandler(async (event) => {
    
    const id = getRouterParam(event, 'id');
    const ticket = await prisma.ticket.delete({
        where: {
            id: id
        }
    });
    return {
        ticket: ticket
    }
})