export default defineEventHandler(async (event) => {
    const ticket = await prisma.ticket.findMany({});
    return {
        ticket: ticket
    }
})