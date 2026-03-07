import { verifyToken } from '../utils/jwt'

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''

  // Only protect /api routes except auth endpoints
  if (!url.startsWith('/api/') || url.startsWith('/api/auth/')) return

  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const token = authHeader.slice(7)
  try {
    const payload = verifyToken(token)
    event.context.auth = { userId: payload.userId, email: payload.email }
  } catch {
    setResponseStatus(event, 401)
    return { error: 'Invalid or expired token' }
  }
})
