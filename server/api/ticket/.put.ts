export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const body = await readBody(event);

    if (!body.title || !body.content || body.reward === undefined || !body.maxFinishers || !body.maxParticipants) {
        setResponseStatus(event, 400)
        return { error: 'Missing required fields: title, content, reward, maxFinishers, maxParticipants' }
    }

    if (typeof body.reward !== 'number' || body.reward < 0) {
        setResponseStatus(event, 400)
        return { error: 'Reward must be a non-negative number' }
    }

    if (typeof body.maxFinishers !== 'number' || body.maxFinishers < 1) {
        setResponseStatus(event, 400)
        return { error: 'maxFinishers must be at least 1' }
    }

    const allowedEmails: string[] = Array.isArray(body.allowedEmails)
        ? body.allowedEmails.filter((e: unknown) => typeof e === 'string' && e.trim() !== '').map((e: string) => e.trim().toLowerCase())
        : []

    const totalEscrow = body.reward * body.maxFinishers

    const result = await prisma.$transaction(async (tx) => {
        const creator = await tx.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, balance: true }
        })

        if (creator === null) {
            return { creatorNotFound: true }
        }

        if (totalEscrow > 0 && creator.balance < totalEscrow) {
            return { insufficientBalance: true }
        }

        if (totalEscrow > 0) {
            await tx.user.update({
                where: { id: auth.userId },
                data: { balance: { decrement: totalEscrow } }
            })
        }

        const resp = await tx.ticket.create({
            data: {
                title: body.title,
                content: body.content,
                user: { connect: { id: auth.userId } },
                reward: body.reward,
                maxFinishers: body.maxFinishers,
                maxParticipants: body.maxParticipants,
                allowedEmails
            }
        });

        return { ticket: resp }
    })

    if ('creatorNotFound' in result) {
        setResponseStatus(event, 404)
        return { error: 'Creator not found' }
    }

    if ('insufficientBalance' in result) {
        setResponseStatus(event, 400)
        return { error: 'Insufficient balance to fund the task reward' }
    }

    return {
        message: 'Ticket created successfully',
        ticket: result.ticket
    };
});
