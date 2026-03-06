export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const resp = await prisma.ticket.create({
        data: {
            title: body.title,
            content: body.content,
            user: {
                connect:{
                    email: body.email
                }
            },
            reward: body.reward,
            maxFinishers: body.maxFinishers,
            maxParticipants: body.maxParticipants
        }
    });
    return {
        message: 'Ticket created successfully',
        resp
    };
});
