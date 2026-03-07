export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        setResponseStatus(event, 400);
        return {
            error: "Missing transaction id"
        };
    }

    const transaction = await prisma.transaction.findUnique({
        where: {
            id
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (transaction === null) {
        setResponseStatus(event, 404);
        return {
            error: "Transaction not found"
        };
    }

    return {
        transaction
    };
});
