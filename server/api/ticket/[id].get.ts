export default defineEventHandler((event) => {
    const id = getRouterParam(event, 'id');
    const ticket = prisma.ticket.findUnique({
        where: {
            id: id
        }
    });
    return {
        ticket: ticket
    }
})