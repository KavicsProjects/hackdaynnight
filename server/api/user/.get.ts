export default defineEventHandler(async (event) => {
    const ticket = await prisma.user.findMany({});
    return {
        ticket: ticket
    }
})