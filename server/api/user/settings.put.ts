export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.userId) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const body = await readBody(event)
  const updateData: { name?: string; profilePicture?: string } = {}

  if (body?.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      setResponseStatus(event, 400)
      return { error: 'Name must be a non-empty string' }
    }
    updateData.name = body.name.trim()
  }

  if (body?.profilePicture !== undefined) {
    updateData.profilePicture = body.profilePicture
  }

  if (Object.keys(updateData).length === 0) {
    setResponseStatus(event, 400)
    return { error: 'Nothing to update' }
  }

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: updateData,
    select: { id: true, name: true, email: true, balance: true, profilePicture: true, updatedAt: true }
  })

  return { user }
})
