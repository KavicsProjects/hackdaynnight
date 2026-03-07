export default defineEventHandler(async (event) => {
    //TODO átírni GET req-re és -> userId: event.context.auth.userId,

    const body = await readBody(event);

    if (!body.senderId || !body.receiverId || body.amount === undefined) {
        setResponseStatus(event, 400);
        return {
            error: "Missing senderId, receiverId or amount"
        };
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
        setResponseStatus(event, 400);
        return {
            error: "Amount must be a positive number"
        };
    }

    if (body.senderId === body.receiverId) {
        setResponseStatus(event, 400);
        return {
            error: "Sender and receiver must be different users"
        };
    }

    const result = await prisma.$transaction(async (tx) => {
        const sender = await tx.user.findUnique({
            where: { id: body.senderId },
            select: { id: true, balance: true }
        });

        if (sender === null) {
            return { senderNotFound: true };
        }

        if (sender.balance < body.amount) {
            return { insufficientBalance: true };
        }

        const receiver = await tx.user.findUnique({
            where: { id: body.receiverId },
            select: { id: true }
        });

        if (receiver === null) {
            return { receiverNotFound: true };
        }

        await tx.user.update({
            where: { id: body.senderId },
            data: { balance: { decrement: body.amount } }
        });

        await tx.user.update({
            where: { id: body.receiverId },
            data: { balance: { increment: body.amount } }
        });

        const transaction = await tx.transaction.create({
            data: {
                amount: body.amount,
                user: {
                    connect: { id: body.senderId }
                },
                receiver: {
                    connect: { id: body.receiverId }
                }
            }
        });

        return { transaction };
    });

    if ('senderNotFound' in result) {
        setResponseStatus(event, 404);
        return {
            error: "Sender not found"
        };
    }

    if ('insufficientBalance' in result) {
        setResponseStatus(event, 400);
        return {
            error: "Insufficient balance"
        };
    }

    if ('receiverNotFound' in result) {
        setResponseStatus(event, 404);
        return {
            error: "Receiver not found"
        };
    }

    return {
        response: result
    };
});
