export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const resp = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
            password: body.password
        }
    });
    return {
        message: 'User created successfully',
        resp
    };
});
