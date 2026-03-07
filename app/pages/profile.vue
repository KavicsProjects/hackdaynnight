<template>
  <div class="page">
    <header class="top-header">
      <h1 class="page-title">Profile</h1>
      <NuxtLink to="/settings" class="icon-btn" aria-label="Settings">
        <Icon name="mdi:cog-outline" />
      </NuxtLink>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <template v-else-if="user">
      <!-- Avatar & name card -->
      <section class="profile-card">
        <div class="avatar-wrap">
          <img
            v-if="user.profilePicture"
            :src="user.profilePicture"
            :alt="user.name"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ user.name.charAt(0).toUpperCase() }}</span>
          </div>
          <NuxtLink to="/settings" class="avatar-edit-btn" aria-label="Edit profile">
            <Icon name="mdi:pencil" />
          </NuxtLink>
        </div>
        <h2 class="user-name">{{ user.name }}</h2>
        <p class="user-email">{{ user.email }}</p>
        <div class="balance-badge">
          <Icon name="mdi:wallet-outline" class="badge-icon" />
          <span>{{ user.balance.toLocaleString('hu-HU') }} HUF</span>
        </div>
      </section>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card">
          <p class="stat-value">{{ sentCount }}</p>
          <p class="stat-label">Sent</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">{{ receivedCount }}</p>
          <p class="stat-label">Received</p>
        </div>
        <div class="stat-card">
          <p class="stat-value">{{ totalVolume.toLocaleString('hu-HU') }}</p>
          <p class="stat-label">Total HUF</p>
        </div>
      </div>

      <!-- Recent transactions -->
      <section class="activity-section">
        <div class="section-header">
          <span class="section-title">Recent Transactions</span>
          <NuxtLink to="/fizetesek" class="see-all">See all</NuxtLink>
        </div>
        <div class="tx-list">
          <div v-for="tx in recentTransactions" :key="tx.id" class="tx-item">
            <div class="tx-icon-wrap" :style="{ background: tx.sent ? 'rgba(255,92,122,0.15)' : 'rgba(0,212,170,0.15)' }">
              <Icon :name="tx.sent ? 'mdi:arrow-up' : 'mdi:arrow-down'" class="tx-icon" />
            </div>
            <div class="tx-info">
              <span class="tx-name">{{ tx.sent ? tx.receiver.name : tx.user.name }}</span>
              <span class="tx-date">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <span class="tx-amount" :class="tx.sent ? 'negative' : 'positive'">
              {{ tx.sent ? '-' : '+' }}{{ tx.amount.toLocaleString('hu-HU') }} HUF
            </span>
          </div>
          <p v-if="recentTransactions.length === 0" class="empty-state">No transactions yet</p>
        </div>
      </section>

      <!-- Logout -->
      <button class="logout-btn" @click="handleLogout">
        <Icon name="mdi:logout" />
        Sign Out
      </button>
    </template>

    <div v-else class="empty-state-full">
      <Icon name="mdi:account-off-outline" class="empty-icon" />
      <p>Not logged in</p>
      <NuxtLink to="/loginregister" class="login-link">Sign In</NuxtLink>
    </div>

    <div class="nav-spacer"></div>
    <Navigation />
  </div>
</template>

<script setup>
const { user, fetchUser, logout, authHeaders } = useAuth()

const loading = ref(true)
const transactions = ref([])

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    try {
      const data = await $fetch('/api/transaction/my', { headers: authHeaders() })
      transactions.value = data.transactions ?? []
    } catch {}
  }
  loading.value = false
})

const sentCount = computed(() =>
  transactions.value.filter(tx => tx.userId === user.value?.id).length
)
const receivedCount = computed(() =>
  transactions.value.filter(tx => tx.receiverId === user.value?.id).length
)
const totalVolume = computed(() =>
  transactions.value.reduce((sum, tx) => sum + tx.amount, 0)
)
const recentTransactions = computed(() =>
  transactions.value.slice(0, 5).map(tx => ({
    ...tx,
    sent: tx.userId === user.value?.id
  }))
)

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
}

function handleLogout() {
  logout()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--clr-bg);
  padding: 1.5rem 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--clr-text);
}

.icon-btn {
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
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--clr-card-high);
}

/* ── Loading ── */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--clr-border);
  border-top-color: var(--clr-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Profile card ── */
.profile-card {
  background: var(--clr-card);
  border-radius: 24px;
  border: 1px solid var(--clr-border);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.avatar-wrap {
  position: relative;
  margin-bottom: 0.25rem;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--clr-primary);
}

.avatar-placeholder {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  border: 3px solid var(--clr-primary);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: var(--clr-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #fff;
  text-decoration: none;
}

.user-name {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--clr-text);
  text-align: center;
}

.user-email {
  font-size: 0.875rem;
  color: var(--clr-text-sub);
}

.balance-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--clr-primary-dim);
  color: var(--clr-primary);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

.badge-icon {
  font-size: 1.125rem;
}

/* ── Stats row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.stat-card {
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 18px;
  padding: 1rem 0.75rem;
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--clr-text);
  line-height: 1;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--clr-text-sub);
  font-weight: 600;
}

/* ── Activity section ── */
.activity-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--clr-text);
}

.see-all {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--clr-primary);
  text-decoration: none;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: var(--clr-card);
  border-radius: 16px;
  border: 1px solid var(--clr-border);
}

.tx-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tx-icon {
  font-size: 1.25rem;
  color: var(--clr-text);
}

.tx-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tx-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--clr-text);
}

.tx-date {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

.tx-amount {
  font-size: 0.9375rem;
  font-weight: 700;
}

.tx-amount.positive { color: var(--clr-positive); }
.tx-amount.negative { color: var(--clr-negative); }

.empty-state {
  text-align: center;
  color: var(--clr-text-dim);
  padding: 1.5rem;
  font-size: 0.9375rem;
}

/* ── Logout ── */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: rgba(255, 92, 122, 0.12);
  color: var(--clr-negative);
  border: 1px solid rgba(255, 92, 122, 0.25);
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 92, 122, 0.2);
}

/* ── Empty state full ── */
.empty-state-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--clr-text-sub);
  padding: 3rem;
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--clr-text-dim);
}

.login-link {
  padding: 0.75rem 2rem;
  background: var(--clr-primary);
  color: #fff;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1rem;
}

.nav-spacer {
  height: 100px;
}
</style>
