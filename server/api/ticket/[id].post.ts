export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.userId) {
        setResponseStatus(event, 401)
        return { error: 'Unauthorized' }
    }

    const id = getRouterParam(event, 'id');

    const existing = await prisma.ticket.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) {
        setResponseStatus(event, 404)
        return { error: 'Ticket not found' }
    }

    if (existing.userId !== auth.userId) {
        setResponseStatus(event, 403)
        return { error: 'Only the task creator can update this task' }
    }

    const body = await readBody(event);
    const { title, content } = body
    const tags: string[] | undefined = Array.isArray(body.tags)
        ? body.tags.filter((t: unknown) => typeof t === 'string' && t.trim() !== '').map((t: string) => t.trim().toLowerCase().replace(/\s+/g, '-'))
        : undefined
    const ticket = await prisma.ticket.update({
        where: { id },
        data: { title, content, ...(tags !== undefined ? { tags } : {}) }
    });
    return {
        ticket: ticket
    }
})