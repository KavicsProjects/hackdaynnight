<!-- Login/Register page with JWT authentication -->

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand">
        <div class="brand-icon">
          <Icon name="mdi:bank-outline" />
        </div>
        <span class="brand-name">FinTrack</span>
      </div>

      <div class="toggle-container">
        <div
          class="toggle-slider"
          :style="{ transform: activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)' }"
        ></div>
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'login' }"
          @click="handleTabChange('login')"
        >
          Login
        </button>
        <button
          class="toggle-btn"
          :class="{ active: activeTab === 'register' }"
          @click="handleTabChange('register')"
        >
          Register
        </button>
      </div>

      <h2 class="title">{{ activeTab === 'login' ? 'Welcome Back!' : 'Create Account' }}</h2>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="input-group" v-if="activeTab === 'register'">
          <label>Full Name</label>
          <div class="input-wrap">
            <Icon name="mdi:account-outline" class="input-icon" />
            <input v-model="formData.name" type="text" placeholder="John Doe" required />
          </div>
        </div>

        <div class="input-group">
          <label>Email Address</label>
          <div class="input-wrap">
            <Icon name="mdi:email-outline" class="input-icon" />
            <input v-model="formData.email" type="email" placeholder="example@email.com" required />
          </div>
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="input-wrap">
            <Icon name="mdi:lock-outline" class="input-icon" />
            <input v-model="formData.password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Sign Up') }}
        </button>
      </form>

      <p class="status-msg error" v-if="errorMsg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const { login, register } = useAuth()

const activeTab = ref('login')
const isLoading = ref(false)
const errorMsg = ref('')

const formData = reactive({
  name: '',
  email: '',
  password: ''
})

const clearForm = () => {
  formData.name = ''
  formData.email = ''
  formData.password = ''
  errorMsg.value = ''
}

const handleTabChange = (tab) => {
  if (activeTab.value !== tab) {
    activeTab.value = tab
    clearForm()
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {
    if (activeTab.value === 'login') {
      await login(formData.email, formData.password)
    } else {
      await register(formData.name, formData.email, formData.password)
    }
    await navigateTo('/home')
  } catch (err) {
    errorMsg.value = err?.data?.error ?? err?.message ?? 'Something went wrong'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--clr-bg);
  font-family: 'Inter', sans-serif;
  padding: 1.5rem;
}

.auth-card {
  background: var(--clr-card);
  padding: 2.5rem 2rem;
  border-radius: 24px;
  border: 1px solid var(--clr-border);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.375rem;
  color: #fff;
}

.brand-name {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--clr-text);
  letter-spacing: -0.02em;
}

.toggle-container {
  display: flex;
  background: var(--clr-surface);
  padding: 4px;
  border-radius: 14px;
  position: relative;
  margin-bottom: 1.75rem;
  border: 1px solid var(--clr-border);
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--clr-primary);
  border-radius: 10px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.toggle-btn {
  flex: 1;
  padding: 0.625rem;
  border: none;
  background: none;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
  color: var(--clr-text-sub);
}

.toggle-btn.active {
  color: #fff;
}

.title {
  margin-bottom: 1.5rem;
  color: var(--clr-text);
  font-size: 1.375rem;
  font-weight: 700;
}

.auth-form {
  text-align: left;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--clr-text-dim);
  font-size: 1.125rem;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 0.8rem 0.875rem 0.8rem 2.5rem;
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.input-wrap input::placeholder {
  color: var(--clr-text-dim);
}

.input-wrap input:focus {
  border-color: var(--clr-primary);
}

.submit-btn {
  width: 100%;
  padding: 0.9rem;
  background: var(--clr-primary);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: opacity 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-msg {
  margin-top: 1rem;
  font-size: 0.875rem;
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
}

.status-msg.error {
  color: var(--clr-negative);
  background: rgba(255, 92, 122, 0.12);
  border: 1px solid rgba(255, 92, 122, 0.25);
}
</style>