<template>
  <div class="page">
    <header class="top-header">
      <div>
        <h1 class="page-title">Transactions</h1>
        <span class="page-subtitle">{{ filteredConversations.length }} conversations</span>
      </div>
      <button class="icon-btn" @click="showSendModal = true" aria-label="New transaction">
        <Icon name="mdi:plus" />
      </button>
    </header>

    <!-- Search bar -->
    <div class="search-wrap">
      <Icon name="mdi:magnify" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search people or amounts..."
        class="search-input"
      />
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- Conversation list -->
      <div class="conversation-list" v-if="filteredConversations.length > 0">
        <div
          v-for="conv in filteredConversations"
          :key="conv.userId"
          class="conversation-item"
          @click="openConversation(conv)"
          :class="{ active: activeConv?.userId === conv.userId }"
        >
          <div class="conv-avatar">
            <img v-if="conv.profilePicture" :src="conv.profilePicture" :alt="conv.name" class="conv-img" />
            <div v-else class="conv-initial">{{ conv.name.charAt(0).toUpperCase() }}</div>
          </div>
          <div class="conv-info">
            <div class="conv-header-row">
              <span class="conv-name">{{ conv.name }}</span>
              <span class="conv-date">{{ formatDate(conv.lastAt) }}</span>
            </div>
            <div class="conv-preview-row">
              <span class="conv-preview">{{ conv.lastMessage }}</span>
              <span class="conv-amount" :class="conv.lastSent ? 'negative' : 'positive'">
                {{ conv.lastSent ? '-' : '+' }}{{ conv.lastAmount.toLocaleString('hu-HU') }} HUF
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Icon name="mdi:swap-horizontal" class="empty-icon" />
        <p>No transactions yet</p>
        <button class="send-btn-outline" @click="showSendModal = true">Send Money</button>
      </div>
    </template>

    <!-- Conversation detail slide-in -->
    <div v-if="activeConv" class="conv-detail-overlay" @click.self="activeConv = null">
      <div class="conv-detail">
        <div class="detail-header">
          <button class="close-btn" @click="activeConv = null">
            <Icon name="mdi:arrow-left" />
          </button>
          <div class="detail-avatar">
            <img v-if="activeConv.profilePicture" :src="activeConv.profilePicture" :alt="activeConv.name" class="conv-img" />
            <div v-else class="conv-initial">{{ activeConv.name.charAt(0).toUpperCase() }}</div>
          </div>
          <div>
            <p class="detail-name">{{ activeConv.name }}</p>
            <p class="detail-email">{{ activeConv.email }}</p>
          </div>
        </div>

        <div class="messages-list" ref="messagesList">
          <div
            v-for="tx in activeConv.transactions"
            :key="tx.id"
            class="message-bubble"
            :class="tx.userId === currentUserId ? 'sent' : 'received'"
          >
            <div class="bubble-amount">
              {{ tx.userId === currentUserId ? '-' : '+' }}{{ tx.amount.toLocaleString('hu-HU') }} HUF
            </div>
            <div class="bubble-time">{{ formatDateTime(tx.createdAt) }}</div>
          </div>
        </div>

        <div class="detail-send">
          <div class="amount-input-wrap">
            <input
              v-model.number="sendAmount"
              type="number"
              min="1"
              placeholder="Amount (HUF)"
              class="amount-input"
              @keyup.enter="sendMoney"
            />
          </div>
          <button class="send-action-btn" :disabled="sending || !sendAmount || sendAmount <= 0" @click="sendMoney">
            <span v-if="sending" class="spinner-sm"></span>
            <Icon v-else name="mdi:send" />
          </button>
        </div>
        <p v-if="sendError" class="send-error">{{ sendError }}</p>
      </div>
    </div>

    <!-- New transaction modal -->
    <div v-if="showSendModal" class="modal-overlay" @click.self="showSendModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Send Money</h2>
          <button class="close-btn" @click="showSendModal = false">
            <Icon name="mdi:close" />
          </button>
        </div>

        <div class="modal-body">
          <div class="input-group">
            <label>Recipient (email or ID)</label>
            <div class="input-wrap">
              <Icon name="mdi:account-search-outline" class="input-icon" />
              <input v-model="newTx.receiver" type="text" placeholder="email@example.com" class="text-input" />
            </div>
          </div>
          <div class="input-group">
            <label>Amount (HUF)</label>
            <div class="input-wrap">
              <Icon name="mdi:cash" class="input-icon" />
              <input v-model.number="newTx.amount" type="number" min="1" placeholder="1000" class="text-input" />
            </div>
          </div>
          <p v-if="modalError" class="send-error">{{ modalError }}</p>
          <button class="save-btn" :disabled="sending" @click="submitNewTx">
            <span v-if="sending" class="spinner-sm"></span>
            {{ sending ? 'Sending...' : 'Send' }}
          </button>
        </div>
      </div>
    </div>

    <div class="nav-spacer"></div>
    <Navigation />
  </div>
</template>

<script setup>
const { user, fetchUser, authHeaders } = useAuth()

const loading = ref(true)
const transactions = ref([])
const searchQuery = ref('')
const activeConv = ref(null)
const showSendModal = ref(false)
const sendAmount = ref(null)
const sending = ref(false)
const sendError = ref('')
const modalError = ref('')
const messagesList = ref(null)
const newTx = reactive({ receiver: '', amount: null })

const currentUserId = computed(() => user.value?.id)

onMounted(async () => {
  await fetchUser()
  await loadTransactions()
  loading.value = false
})

async function loadTransactions() {
  if (!user.value) return
  try {
    const data = await $fetch('/api/transaction/my', { headers: authHeaders() })
    transactions.value = data.transactions ?? []
  } catch {}
}

const conversations = computed(() => {
  if (!user.value) return []
  const map = new Map()

  for (const tx of transactions.value) {
    const isSent = tx.userId === currentUserId.value
    const other = isSent ? tx.receiver : tx.user
    const key = other.id

    if (!map.has(key)) {
      map.set(key, {
        userId: other.id,
        name: other.name,
        email: other.email,
        profilePicture: other.profilePicture,
        transactions: [],
        lastAt: tx.createdAt,
        lastAmount: tx.amount,
        lastSent: isSent,
        lastMessage: isSent ? `You sent ${tx.amount.toLocaleString('hu-HU')} HUF` : `Received ${tx.amount.toLocaleString('hu-HU')} HUF`
      })
    }

    map.get(key).transactions.push(tx)
    if (new Date(tx.createdAt) > new Date(map.get(key).lastAt)) {
      map.get(key).lastAt = tx.createdAt
      map.get(key).lastAmount = tx.amount
      map.get(key).lastSent = isSent
      map.get(key).lastMessage = isSent
        ? `You sent ${tx.amount.toLocaleString('hu-HU')} HUF`
        : `Received ${tx.amount.toLocaleString('hu-HU')} HUF`
    }
  }

  return [...map.values()].sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
})

const filteredConversations = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    String(c.lastAmount).includes(q)
  )
})

function openConversation(conv) {
  activeConv.value = { ...conv }
  sendError.value = ''
  sendAmount.value = null
  nextTick(() => {
    if (messagesList.value) {
      messagesList.value.scrollTop = messagesList.value.scrollHeight
    }
  })
}

async function sendMoney() {
  if (!sendAmount.value || sendAmount.value <= 0) return
  sending.value = true
  sendError.value = ''

  try {
    await $fetch('/api/transaction', {
      method: 'POST',
      headers: authHeaders(),
      body: { receiverId: activeConv.value.userId, amount: sendAmount.value }
    })
    sendAmount.value = null
    await loadTransactions()
    const updated = conversations.value.find(c => c.userId === activeConv.value.userId)
    if (updated) activeConv.value = { ...updated }
    nextTick(() => {
      if (messagesList.value) messagesList.value.scrollTop = messagesList.value.scrollHeight
    })
  } catch (err) {
    sendError.value = err?.data?.error ?? 'Transaction failed'
  } finally {
    sending.value = false
  }
}

async function submitNewTx() {
  if (!newTx.receiver || !newTx.amount || newTx.amount <= 0) return
  sending.value = true
  modalError.value = ''

  try {
    const users = await $fetch('/api/user', { headers: authHeaders() })
    const receiver = (users.ticket ?? []).find(u => u.email === newTx.receiver || u.id === newTx.receiver)
    if (!receiver) {
      modalError.value = 'User not found'
      sending.value = false
      return
    }

    await $fetch('/api/transaction', {
      method: 'POST',
      headers: authHeaders(),
      body: { receiverId: receiver.id, amount: newTx.amount }
    })

    showSendModal.value = false
    newTx.receiver = ''
    newTx.amount = null
    await loadTransactions()
  } catch (err) {
    modalError.value = err?.data?.error ?? 'Transaction failed'
  } finally {
    sending.value = false
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--clr-text-dim);
  font-size: 1.125rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.8rem 0.875rem 0.8rem 2.5rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.search-input::placeholder { color: var(--clr-text-dim); }
.search-input:focus { border-color: var(--clr-primary); }

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

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: var(--clr-card);
  border-radius: 18px;
  border: 1px solid var(--clr-border);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.conversation-item:hover,
.conversation-item.active {
  background: var(--clr-card-high);
  border-color: var(--clr-primary);
}

.conv-avatar { flex-shrink: 0; }

.conv-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--clr-border);
}

.conv-initial {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
}

.conv-info { flex: 1; min-width: 0; }

.conv-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.conv-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--clr-text);
}

.conv-date {
  font-size: 0.75rem;
  color: var(--clr-text-dim);
}

.conv-preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.conv-preview {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.conv-amount {
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.conv-amount.positive { color: var(--clr-positive); }
.conv-amount.negative { color: var(--clr-negative); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--clr-text-sub);
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--clr-text-dim);
}

.send-btn-outline {
  padding: 0.75rem 2rem;
  background: var(--clr-primary-dim);
  color: var(--clr-primary);
  border: 1px solid rgba(0,212,170,0.3);
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  font-family: inherit;
}

.conv-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 500;
  display: flex;
  align-items: flex-end;
}

.conv-detail {
  width: 100%;
  max-height: 85vh;
  background: var(--clr-surface);
  border-radius: 28px 28px 0 0;
  border: 1px solid var(--clr-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--clr-border);
  flex-shrink: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-text-sub);
  font-size: 1.125rem;
  cursor: pointer;
  flex-shrink: 0;
}

.detail-avatar { flex-shrink: 0; }

.detail-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--clr-text);
}

.detail-email {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message-bubble {
  max-width: 70%;
  padding: 0.625rem 0.875rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.message-bubble.sent {
  align-self: flex-end;
  background: var(--clr-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-bubble.received {
  align-self: flex-start;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-bottom-left-radius: 4px;
}

.bubble-amount {
  font-size: 1rem;
  font-weight: 700;
}

.bubble-time {
  font-size: 0.6875rem;
  opacity: 0.75;
}

.detail-send {
  display: flex;
  gap: 0.625rem;
  padding: 0.875rem 1.25rem 1.25rem;
  border-top: 1px solid var(--clr-border);
  flex-shrink: 0;
}

.amount-input-wrap { flex: 1; }

.amount-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  font-family: inherit;
}

.amount-input:focus { border-color: var(--clr-primary); }

.send-action-btn {
  width: 48px;
  height: 48px;
  background: var(--clr-primary);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.send-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-error {
  color: var(--clr-negative);
  font-size: 0.8125rem;
  padding: 0 1.25rem 0.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 600;
  display: flex;
  align-items: flex-end;
}

.modal {
  width: 100%;
  background: var(--clr-surface);
  border-radius: 28px 28px 0 0;
  border: 1px solid var(--clr-border);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--clr-border);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--clr-text);
}

.modal-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  font-weight: 600;
  margin-bottom: 0.5rem;
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

.text-input {
  width: 100%;
  padding: 0.8rem 0.875rem 0.8rem 2.5rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.text-input::placeholder { color: var(--clr-text-dim); }
.text-input:focus { border-color: var(--clr-primary); }

.save-btn {
  width: 100%;
  padding: 0.9rem;
  background: var(--clr-primary);
  color: #fff;
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
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-spacer {
  height: 100px;
}
</style>
