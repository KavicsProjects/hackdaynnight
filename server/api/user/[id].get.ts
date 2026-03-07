export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        setResponseStatus(event, 400)
        return { error: 'Missing user id' }
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, profilePicture: true }
    })

    if (!user) {
        setResponseStatus(event, 404)
        return { error: 'User not found' }
    }

    return { user }
})
