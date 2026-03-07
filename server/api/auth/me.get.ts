export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.userId) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, balance: true, profilePicture: true, createdAt: true }
  })

  if (!user) {
    setResponseStatus(event, 404)
    return { error: 'User not found' }
  }

  return { user }
})
