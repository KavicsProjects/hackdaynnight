import bcrypt from 'bcryptjs'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.email || !body?.password) {
    setResponseStatus(event, 400)
    return { error: 'Email and password are required' }
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true, name: true, email: true, password: true, balance: true, profilePicture: true, createdAt: true }
  })

  if (!user) {
    setResponseStatus(event, 401)
    return { error: 'Invalid credentials' }
  }

  const valid = await bcrypt.compare(body.password, user.password)
  if (!valid) {
    setResponseStatus(event, 401)
    return { error: 'Invalid credentials' }
  }

  const { password: _, ...safeUser } = user
  const token = signToken({ userId: user.id, email: user.email })

  return { token, user: safeUser }
})
