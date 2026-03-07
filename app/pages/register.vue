<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <Icon name="mdi:chart-line-variant" />
        </div>
        <span class="brand-name">FinTrack</span>
      </div>

      <h1 class="title">Create account</h1>
      <p class="subtitle">Start tracking your finances today</p>

      <form class="form" @submit.prevent="handleSubmit">
        <div class="field">
          <label class="field-label">Full name</label>
          <div class="field-input-wrap">
            <Icon name="mdi:account-outline" class="field-icon" />
            <input
              v-model="name"
              type="text"
              class="field-input"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">Email address</label>
          <div class="field-input-wrap">
            <Icon name="mdi:email-outline" class="field-icon" />
            <input
              v-model="email"
              type="email"
              class="field-input"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label">Password</label>
          <div class="field-input-wrap">
            <Icon name="mdi:lock-outline" class="field-icon" />
            <input
              v-model="password"
              type="password"
              class="field-input"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="footer-text">
        Already have an account?
        <NuxtLink to="/login" class="footer-link">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = ''

  // TODO: replace with real API call
  await new Promise(resolve => setTimeout(resolve, 1200))

  isLoading.value = false
  router.push('/home')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--clr-bg);
  padding: 1.5rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--clr-card);
  border-radius: 24px;
  padding: 2.5rem;
  border: 1px solid var(--clr-border);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 2.25rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00D4AA 0%, #0098EF 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #fff;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--clr-text);
  letter-spacing: -0.02em;
}

/* Heading */
.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--clr-text);
  letter-spacing: -0.03em;
  margin-bottom: 0.375rem;
}

.subtitle {
  font-size: 0.9375rem;
  color: var(--clr-text-sub);
  margin-bottom: 2rem;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--clr-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  color: var(--clr-text-dim);
  pointer-events: none;
}

.field-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.875rem;
  background: var(--clr-surface);
  border: 1.5px solid var(--clr-border);
  border-radius: 12px;
  color: var(--clr-text);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s;
}

.field-input::placeholder {
  color: var(--clr-text-dim);
}

.field-input:focus {
  border-color: var(--clr-primary);
}

.error-msg {
  font-size: 0.875rem;
  color: var(--clr-negative);
}

/* Button */
.btn-primary {
  margin-top: 0.5rem;
  padding: 0.9375rem;
  background: linear-gradient(135deg, #00D4AA 0%, #0098EF 100%);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Footer */
.footer-text {
  margin-top: 1.75rem;
  font-size: 0.9rem;
  color: var(--clr-text-sub);
  text-align: center;
}

.footer-link {
  color: var(--clr-primary);
  font-weight: 600;
}
</style>
