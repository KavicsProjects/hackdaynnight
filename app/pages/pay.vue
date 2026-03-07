<template>
  <div class="page">
    <header class="top-header">
      <NuxtLink to="/qrgenerator" class="back-btn">
        <Icon name="mdi:arrow-left" />
      </NuxtLink>
      <div class="header-title">
        <h1 class="page-title">Quick Pay</h1>
        <span class="page-subtitle">One-click payment</span>
      </div>
      <div style="width: 40px;" />
    </header>

    <!-- Loading state -->
    <section v-if="loading" class="content-card">
      <div class="spinner-wrap">
        <Icon name="mdi:loading" class="spinner" />
        <p class="loading-text">Loading payment details…</p>
      </div>
    </section>

    <!-- Error: missing/invalid params -->
    <section v-else-if="paramError" class="content-card">
      <div class="state-icon-wrap error">
        <Icon name="mdi:alert-circle-outline" class="state-icon" />
      </div>
      <p class="state-title">Invalid Payment Link</p>
      <p class="state-sub">This QR code does not contain valid payment information.</p>
      <NuxtLink to="/qrgenerator" class="action-btn secondary">Go Back</NuxtLink>
    </section>

    <!-- Success state -->
    <section v-else-if="paymentDone" class="content-card">
      <div class="state-icon-wrap success">
        <Icon name="mdi:check-circle-outline" class="state-icon" />
      </div>
      <p class="state-title">Payment Sent!</p>
      <p class="state-sub">
        You sent <strong>{{ parsedAmount.toLocaleString('hu-HU') }} HUF</strong>
        to <strong>{{ receiver?.name }}</strong>.
      </p>
      <NuxtLink to="/home" class="action-btn primary">Go to Home</NuxtLink>
    </section>

    <!-- Main payment card -->
    <template v-else-if="receiver">
      <section class="content-card receiver-card">
        <div class="avatar-wrap">
          <img
            v-if="receiver.profilePicture"
            :src="receiver.profilePicture"
            :alt="receiver.name"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ receiver.name.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <p class="receiver-label">Paying to</p>
        <p class="receiver-name">{{ receiver.name }}</p>
      </section>

      <section class="content-card amount-card">
        <p class="amount-label">Amount</p>
        <p class="amount-value">{{ parsedAmount.toLocaleString('hu-HU') }} <span class="amount-currency">HUF</span></p>
        <p class="balance-hint">Your balance: {{ (user?.balance ?? 0).toLocaleString('hu-HU') }} HUF</p>
      </section>

      <div v-if="payError" class="error-banner">
        <Icon name="mdi:alert-circle-outline" />
        <span>{{ payError }}</span>
      </div>

      <button
        class="action-btn primary pay-btn"
        :disabled="paying || !isLoggedIn || insufficientBalance"
        @click="sendPayment"
      >
        <Icon v-if="paying" name="mdi:loading" class="btn-spinner" />
        <span v-else-if="insufficientBalance">Insufficient balance</span>
        <span v-else>Pay {{ parsedAmount.toLocaleString('hu-HU') }} HUF</span>
      </button>

      <p v-if="!isLoggedIn" class="login-hint">
        <NuxtLink to="/loginregister">Log in</NuxtLink> to complete this payment.
      </p>
    </template>

    <div class="nav-spacer"></div>
    <Navigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const { user, isLoggedIn, fetchUser, authHeaders } = useAuth()

const loading = ref(true)
const paramError = ref(false)
const receiver = ref(null)
const paying = ref(false)
const payError = ref(null)
const paymentDone = ref(false)

const receiverId = computed(() => route.query.to ?? '')
const parsedAmount = computed(() => {
  const v = Math.round(Number(route.query.amount))
  return Number.isFinite(v) && v > 0 && v <= 10_000_000 ? v : 0
})

const insufficientBalance = computed(() =>
  isLoggedIn.value && user.value !== null && parsedAmount.value > (user.value?.balance ?? 0)
)

onMounted(async () => {
  await fetchUser()

  if (!receiverId.value || parsedAmount.value <= 0) {
    paramError.value = true
    loading.value = false
    return
  }

  try {
    const data = await $fetch(`/api/user/${receiverId.value}`)
    receiver.value = data.user
  } catch {
    paramError.value = true
  } finally {
    loading.value = false
  }
})

async function sendPayment() {
  payError.value = null
  paying.value = true
  try {
    await $fetch('/api/transaction', {
      method: 'POST',
      headers: authHeaders(),
      body: { receiverId: receiverId.value, amount: parsedAmount.value }
    })
    await fetchUser()
    paymentDone.value = true
  } catch (err) {
    payError.value = err?.data?.error ?? 'Payment failed. Please try again.'
  } finally {
    paying.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--clr-bg);
  padding: 1.5rem 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ── */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-text-sub);
  font-size: 1.25rem;
  text-decoration: none;
}

.header-title {
  text-align: center;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--clr-text);
  line-height: 1;
  margin-bottom: 0.2rem;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

/* ── Card ── */
.content-card {
  background: var(--clr-card);
  border-radius: 24px;
  border: 1px solid var(--clr-border);
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Spinner ── */
.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.spinner {
  font-size: 2rem;
  color: var(--clr-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.9375rem;
  color: var(--clr-text-sub);
}

/* ── State icons ── */
.state-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.state-icon-wrap.success {
  background: var(--clr-primary-dim);
  color: var(--clr-positive);
}

.state-icon-wrap.error {
  background: rgba(255, 92, 122, 0.1);
  color: var(--clr-negative);
}

.state-icon {
  font-size: 2.25rem;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--clr-text);
}

.state-sub {
  font-size: 0.9rem;
  color: var(--clr-text-sub);
  text-align: center;
  line-height: 1.5;
}

/* ── Receiver card ── */
.avatar-wrap {
  margin-bottom: 0.25rem;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--clr-primary);
}

.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  border: 3px solid var(--clr-primary);
}

.receiver-label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.receiver-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--clr-text);
}

/* ── Amount card ── */
.amount-card {
  gap: 0.5rem;
}

.amount-label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.amount-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--clr-text);
  letter-spacing: -0.03em;
  line-height: 1;
}

.amount-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--clr-text-sub);
}

.balance-hint {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

/* ── Error banner ── */
.error-banner {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 92, 122, 0.1);
  border: 1px solid rgba(255, 92, 122, 0.25);
  border-radius: 14px;
  color: var(--clr-negative);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.9rem;
  animation: fadeIn 0.3s ease;
}

/* ── Buttons ── */
.action-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  text-decoration: none;
}

.action-btn.primary {
  background: var(--clr-primary);
  color: #fff;
}

.action-btn.secondary {
  background: var(--clr-card-high);
  color: var(--clr-text);
  border: 1px solid var(--clr-border);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pay-btn {
  margin-top: 0.25rem;
}

.btn-spinner {
  font-size: 1.25rem;
  animation: spin 1s linear infinite;
}

.login-hint {
  font-size: 0.875rem;
  color: var(--clr-text-sub);
  text-align: center;
}

.login-hint a {
  color: var(--clr-primary);
  font-weight: 600;
  text-decoration: none;
}

.nav-spacer {
  height: 100px;
}
</style>
