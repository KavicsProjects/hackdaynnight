declare module 'h3' {
  interface H3EventContext {
    auth?: {
      userId: string
      email: string
    }
  }
}

export {}
