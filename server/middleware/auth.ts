import { verifyToken } from '../utils/jwt'

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? ''
  const path = url.split('?')[0]

  // Only protect /api routes except public auth endpoints (login & register)
  if (!path.startsWith('/api/') || path === '/api/auth/login' || path === '/api/auth/register') return

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
