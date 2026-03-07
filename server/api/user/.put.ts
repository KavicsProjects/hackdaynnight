import bcrypt from 'bcryptjs'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body?.email || !body?.name || !body?.password) {
        setResponseStatus(event, 400)
        return { error: 'Name, email and password are required' }
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
        setResponseStatus(event, 409)
        return { error: 'Email already in use' }
    }

    const hashedPassword = await bcrypt.hash(body.password, 12)

    const user = await prisma.user.create({
        data: { name: body.name, email: body.email, password: hashedPassword },
        select: { id: true, name: true, email: true, balance: true, profilePicture: true, createdAt: true }
    })

    const token = signToken({ userId: user.id, email: user.email })

    return { token, user }
})
