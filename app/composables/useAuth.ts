interface AuthUser {
  id: string
  name: string
  email: string
  balance: number
  profilePicture?: string | null
  createdAt: string
}

const _user = ref<AuthUser | null>(null)

export function useAuth() {
  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  const user = computed(() => _user.value)
  const isLoggedIn = computed(() => !!token.value)

  async function fetchUser() {
    if (!token.value) return
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      _user.value = data.user
    } catch {
      token.value = null
      _user.value = null
    }
  }

  async function login(email: string, password: string) {
    const data = await $fetch<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    token.value = data.token
    _user.value = data.user
  }

  async function register(name: string, email: string, password: string) {
    const data = await $fetch<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password }
    })
    token.value = data.token
    _user.value = data.user
  }

  function logout() {
    token.value = null
    _user.value = null
    navigateTo('/loginregister')
  }

  function authHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { user, isLoggedIn, token, login, register, logout, fetchUser, authHeaders }
}
