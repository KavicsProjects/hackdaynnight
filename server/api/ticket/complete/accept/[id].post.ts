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

    let resp = [];

    resp[0] = await prisma.userTicketConnect.update({
        where: {
            userId_ticketId: {
                userId: body.userId,
                ticketId: id
            }
        },
        data: {
            acceptedByAuthor: true
        }
    })

    const balanceResp = await prisma.user.findUnique({
        where: {
            id: body.userId
        },
        select: {
            balance: true
        }
    });

    let balance;
    if (balanceResp === null) { balance = 0 } else { balance = balanceResp.balance };

    const ticketResp = await prisma.ticket.findUnique({
        where: {
            id: id
        },
        select: {
            reward: true,
            userId: true
        }
    });

    if (ticketResp === null) {
        setResponseStatus(event, 404);
        return {
            error: "Ticket not found"
        }
    }

    if (ticketResp.reward != 0) {

        resp[1] = await prisma.user.update({
            where: {
                id: body.userId
            },
            data: {
                balance: balance + ticketResp.reward
            }
        });

        resp[2] = await prisma.transaction.create({
            data: {
                amount: ticketResp.reward,
                user: {
                    connect: {
                        id: ticketResp.userId

                    }
                },
                receiver: {
                    connect: {
                        id: body.userId
                    }
                }

            }
        });
    }

    return {
        response: resp
    }
})