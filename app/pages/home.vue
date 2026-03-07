<template>
  <div class="home">
    <!-- Top header: avatar + greeting + notification bell -->
    <header class="top-header">
      <div class="profile-section">
        <NuxtLink to="/profile">
          <img
            v-if="user?.profilePicture"
            :src="user.profilePicture"
            :alt="user.name"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ user?.name?.charAt(0)?.toUpperCase() ?? 'U' }}</span>
          </div>
        </NuxtLink>
        <div class="greeting">
          <span class="greeting-label">{{ greeting }}</span>
          <span class="greeting-name">{{ user?.name ?? 'Guest' }}</span>
        </div>
      </div>
      <button class="icon-btn" aria-label="Notifications">
        <Icon name="mdi:bell-outline" />
      </button>
    </header>

    <!-- Balance card -->
    <section class="balance-card">
      <p class="balance-label">Total Balance</p>
      <h1 class="balance-amount">{{ (user?.balance ?? 0).toLocaleString('hu-HU') }} <span class="balance-currency">HUF</span></h1>
      <div class="balance-change" :class="actualEarnings >= 0 ? 'positive' : 'negative'">
        <Icon :name="actualEarnings >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" class="change-icon" />
        <span>{{ actualEarnings >= 0 ? '+' : '' }}{{ actualEarnings.toLocaleString('hu-HU') }} HUF {{ actualEarnings >= 0 ? 'earned' : 'lost' }}</span>
      </div>
    </section>

    <!-- Graph section -->
    <section class="chart-section">
      <div class="section-header">
        <span class="section-title">Performance</span>
        <div class="time-filters">
          <button
            v-for="period in periods"
            :key="period"
            class="filter-btn"
            :class="{ active: activePeriod === period }"
            @click="activePeriod = period"
          >
            {{ period }}
          </button>
        </div>
      </div>
      <div class="chart-wrapper">
        <Linegraph
          :transactions="allTransactions"
          :current-balance="user?.balance ?? 0"
          :user-id="user?.id ?? ''"
          :period="activePeriod"
        />
      </div>
    </section>

    <!-- Recent activity -->
    <section class="activity-section">
      <div class="section-header">
        <span class="section-title">Recent Activity</span>
        <NuxtLink to="/fizetesek" class="see-all">See all</NuxtLink>
      </div>

      <div class="tx-list">
        <div v-for="(tx, i) in transactions" :key="i" class="tx-item">
          <div class="tx-icon-wrap" :style="{ background: tx.bg }">
            <Icon :name="tx.icon" class="tx-icon" />
          </div>
          <div class="tx-info">
            <span class="tx-name">{{ tx.name }}</span>
            <span class="tx-date">{{ tx.date }}</span>
          </div>
          <span class="tx-amount" :class="tx.amount > 0 ? 'positive' : 'negative'">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount.toLocaleString('hu-HU') }} HUF
          </span>
        </div>
      </div>
    </section>

    <!-- Bottom navigation spacer so content isn't hidden behind nav -->
    <div class="nav-spacer"></div>
    <Navigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { user, fetchUser, authHeaders } = useAuth()
const recentTransactions = ref([])
const allTransactions = ref([])

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    try {
      const data = await $fetch('/api/transaction/my', { headers: authHeaders() })
      const txList = data.transactions ?? []
      allTransactions.value = txList
      recentTransactions.value = txList.slice(0, 3).map(tx => ({
        name: tx.userId === user.value.id ? tx.receiver.name : tx.user.name,
        date: new Date(tx.createdAt).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
        amount: tx.userId === user.value.id ? -tx.amount : tx.amount,
        icon: tx.userId === user.value.id ? 'mdi:arrow-up' : 'mdi:arrow-down',
        bg: tx.userId === user.value.id ? 'rgba(255, 92, 122, 0.15)' : 'rgba(0, 212, 170, 0.15)'
      }))
    } catch {}
  }
})

const actualEarnings = computed(() => {
  if (!user.value) return 0
  return allTransactions.value
    .filter(tx => tx.receiverId === user.value!.id)
    .reduce((sum, tx) => sum + tx.amount, 0)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

const periods = ['1W', '1M', '3M', '1Y']
const activePeriod = ref('1M')

const transactions = computed(() => recentTransactions.value.length > 0
  ? recentTransactions.value
  : [
    { name: 'Salary', date: 'Jun 1', amount: 450000, icon: 'mdi:bank-transfer-in', bg: 'rgba(0, 212, 170, 0.15)' },
    { name: 'Grocery Store', date: 'Jun 3', amount: -12400, icon: 'mdi:cart-outline', bg: 'rgba(108, 99, 255, 0.15)' },
    { name: 'Freelance payment', date: 'Jun 7', amount: 85000, icon: 'mdi:briefcase-outline', bg: 'rgba(0, 152, 239, 0.15)' },
  ]
)</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--clr-bg);
  padding: 1.5rem 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Top header ── */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--clr-primary);
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  border: 2px solid var(--clr-primary);
}

.greeting {
  display: flex;
  flex-direction: column;
}

.greeting-label {
  font-size: 0.75rem;
  color: var(--clr-text-sub);
}

.greeting-name {
  font-size: 1rem;
  font-weight: 700;
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
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--clr-card-high);
}

/* ── Balance card ── */
.balance-card {
  background: var(--clr-card);
  border-radius: 24px;
  padding: 1.75rem;
  border: 1px solid var(--clr-border);
}

.balance-label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.625rem;
}

.balance-amount {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--clr-text);
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.balance-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--clr-text-sub);
}

.balance-change {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
}

.balance-change.positive {
  color: var(--clr-positive);
  background: var(--clr-primary-dim);
}

.balance-change.negative {
  color: var(--clr-negative);
  background: rgba(255, 92, 122, 0.12);
}

.change-icon {
  font-size: 1rem;
}

/* ── Chart section ── */
.chart-section {
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

.time-filters {
  display: flex;
  gap: 0.25rem;
  background: var(--clr-card);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--clr-border);
}

.filter-btn {
  padding: 0.3rem 0.7rem;
  border: none;
  background: none;
  color: var(--clr-text-sub);
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.filter-btn.active {
  background: var(--clr-card-high);
  color: var(--clr-text);
}

.chart-wrapper {
  background: var(--clr-card);
  border-radius: 20px;
  border: 1px solid var(--clr-border);
  padding: 1rem;
  overflow: hidden;
}

/* ── Activity section ── */
.activity-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.see-all {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--clr-primary);
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.tx-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: var(--clr-card);
  border-radius: 16px;
  border: 1px solid var(--clr-border);
  transition: background 0.15s;
}

.tx-item + .tx-item {
  margin-top: 0.5rem;
}

.tx-item:hover {
  background: var(--clr-card-high);
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

.tx-amount.positive {
  color: var(--clr-positive);
}

.tx-amount.negative {
  color: var(--clr-negative);
}

/* spacer keeps content above the floating nav */
.nav-spacer {
  height: 100px;
}
</style>
