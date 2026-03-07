<template>
  <div class="page">
    <header class="top-header">
      <div>
        <h1 class="page-title">Requests</h1>
        <span class="page-subtitle">Money requests</span>
      </div>
      <button class="icon-btn" @click="showCreateModal = true" aria-label="New request">
        <Icon name="mdi:plus" />
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'received' }" @click="activeTab = 'received'">
          Received
          <span v-if="pendingReceived > 0" class="badge">{{ pendingReceived }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'sent' }" @click="activeTab = 'sent'">
          Sent
        </button>
      </div>

      <!-- Received requests -->
      <div v-if="activeTab === 'received'">
        <div v-if="received.length === 0" class="empty-state">
          <Icon name="mdi:inbox-outline" class="empty-icon" />
          <p>No incoming requests</p>
        </div>
        <div v-else class="request-list">
          <div v-for="req in received" :key="req.id" class="request-card">
            <div class="req-top">
              <div class="req-avatar">
                <img v-if="req.requester.profilePicture" :src="req.requester.profilePicture" :alt="req.requester.name" class="req-img" />
                <div v-else class="req-initial">{{ req.requester.name.charAt(0).toUpperCase() }}</div>
              </div>
              <div class="req-info">
                <span class="req-name">{{ req.requester.name }}</span>
                <span class="req-date">{{ formatDate(req.createdAt) }}</span>
              </div>
              <span class="req-amount">{{ req.amount.toLocaleString('hu-HU') }} HUF</span>
            </div>
            <p class="req-title">{{ req.title }}</p>
            <p class="req-description">{{ req.description }}</p>
            <div v-if="req.status === 'pending'" class="req-actions">
              <button class="btn-decline" @click="confirmDecline(req)">Decline</button>
              <button class="btn-accept" @click="confirmAccept(req)">Accept</button>
            </div>
            <div v-else class="req-status" :class="req.status">
              <Icon :name="req.status === 'accepted' ? 'mdi:check-circle' : 'mdi:close-circle'" />
              {{ req.status === 'accepted' ? 'Accepted' : 'Declined' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sent requests -->
      <div v-if="activeTab === 'sent'">
        <div v-if="sent.length === 0" class="empty-state">
          <Icon name="mdi:send-outline" class="empty-icon" />
          <p>No sent requests</p>
          <button class="send-btn-outline" @click="showCreateModal = true">Create Request</button>
        </div>
        <div v-else class="request-list">
          <div v-for="req in sent" :key="req.id" class="request-card">
            <div class="req-top">
              <div class="req-avatar">
                <img v-if="req.requestee.profilePicture" :src="req.requestee.profilePicture" :alt="req.requestee.name" class="req-img" />
                <div v-else class="req-initial">{{ req.requestee.name.charAt(0).toUpperCase() }}</div>
              </div>
              <div class="req-info">
                <span class="req-name">{{ req.requestee.name }}</span>
                <span class="req-date">{{ formatDate(req.createdAt) }}</span>
              </div>
              <span class="req-amount">{{ req.amount.toLocaleString('hu-HU') }} HUF</span>
            </div>
            <p class="req-title">{{ req.title }}</p>
            <p class="req-description">{{ req.description }}</p>
            <div class="req-status" :class="req.status">
              <Icon :name="req.status === 'accepted' ? 'mdi:check-circle' : req.status === 'declined' ? 'mdi:close-circle' : 'mdi:clock-outline'" />
              {{ req.status === 'accepted' ? 'Accepted' : req.status === 'declined' ? 'Declined' : 'Pending' }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Create request modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Request Money</h2>
          <button class="close-btn" @click="showCreateModal = false">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>From (email or ID)</label>
            <div class="input-wrap">
              <Icon name="mdi:account-search-outline" class="input-icon" />
              <input v-model="newReq.requestee" type="text" placeholder="email@example.com" class="text-input" />
            </div>
          </div>
          <div class="input-group">
            <label>Title</label>
            <div class="input-wrap">
              <Icon name="mdi:format-title" class="input-icon" />
              <input v-model="newReq.title" type="text" placeholder="e.g. Dinner split" class="text-input" />
            </div>
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea v-model="newReq.description" placeholder="Describe why you're requesting this amount…" class="text-area" rows="3"></textarea>
          </div>
          <div class="input-group">
            <label>Amount (HUF)</label>
            <div class="input-wrap">
              <Icon name="mdi:cash" class="input-icon" />
              <input v-model.number="newReq.amount" type="number" min="1" placeholder="1000" class="text-input" />
            </div>
          </div>
          <p v-if="createError" class="form-error">{{ createError }}</p>
          <button class="save-btn" :disabled="creating" @click="submitRequest">
            <span v-if="creating" class="spinner-sm"></span>
            {{ creating ? 'Sending…' : 'Send Request' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Accept confirmation modal -->
    <div v-if="confirmTarget && confirmAction === 'accept'" class="modal-overlay" @click.self="confirmTarget = null">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2 class="modal-title">Confirm Payment</h2>
          <button class="close-btn" @click="confirmTarget = null">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-icon success">
            <Icon name="mdi:cash-check" />
          </div>
          <p class="confirm-text">
            You are about to send <strong>{{ confirmTarget.amount.toLocaleString('hu-HU') }} HUF</strong>
            to <strong>{{ confirmTarget.requester.name }}</strong> for:
          </p>
          <p class="confirm-reason">{{ confirmTarget.title }}</p>
          <p class="balance-hint">Your balance: {{ (user?.balance ?? 0).toLocaleString('hu-HU') }} HUF</p>
          <p v-if="actionError" class="form-error">{{ actionError }}</p>
          <div class="confirm-buttons">
            <button class="btn-secondary" @click="confirmTarget = null">Cancel</button>
            <button class="btn-primary" :disabled="acting" @click="executeAction">
              <span v-if="acting" class="spinner-sm"></span>
              {{ acting ? 'Processing…' : 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Decline confirmation modal -->
    <div v-if="confirmTarget && confirmAction === 'decline'" class="modal-overlay" @click.self="confirmTarget = null">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h2 class="modal-title">Decline Request</h2>
          <button class="close-btn" @click="confirmTarget = null">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-icon danger">
            <Icon name="mdi:cash-remove" />
          </div>
          <p class="confirm-text">
            Decline the request of <strong>{{ confirmTarget.amount.toLocaleString('hu-HU') }} HUF</strong>
            from <strong>{{ confirmTarget.requester.name }}</strong>?
          </p>
          <p class="confirm-reason">{{ confirmTarget.title }}</p>
          <p v-if="actionError" class="form-error">{{ actionError }}</p>
          <div class="confirm-buttons">
            <button class="btn-secondary" @click="confirmTarget = null">Cancel</button>
            <button class="btn-danger" :disabled="acting" @click="executeAction">
              <span v-if="acting" class="spinner-sm"></span>
              {{ acting ? 'Processing…' : 'Decline' }}
            </button>
          </div>
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
const sent = ref([])
const received = ref([])
const activeTab = ref('received')

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newReq = reactive({ requestee: '', title: '', description: '', amount: null })

const confirmTarget = ref(null)
const confirmAction = ref('')
const acting = ref(false)
const actionError = ref('')

const pendingReceived = computed(() => received.value.filter(r => r.status === 'pending').length)

onMounted(async () => {
  await fetchUser()
  await loadRequests()
  loading.value = false
})

async function loadRequests() {
  try {
    const data = await $fetch('/api/money-request/my', { headers: authHeaders() })
    sent.value = data.sent ?? []
    received.value = data.received ?? []
  } catch {}
}

async function submitRequest() {
  if (!newReq.requestee || !newReq.title || !newReq.description || !newReq.amount || newReq.amount <= 0) {
    createError.value = 'Please fill in all fields with valid values.'
    return
  }
  creating.value = true
  createError.value = ''

  try {
    const users = await $fetch('/api/user', { headers: authHeaders() })
    const requestee = (users.ticket ?? []).find(u => u.email === newReq.requestee || u.id === newReq.requestee)
    if (!requestee) {
      createError.value = 'User not found'
      creating.value = false
      return
    }

    await $fetch('/api/money-request', {
      method: 'POST',
      headers: authHeaders(),
      body: {
        requesteeId: requestee.id,
        title: newReq.title,
        description: newReq.description,
        amount: newReq.amount
      }
    })

    showCreateModal.value = false
    newReq.requestee = ''
    newReq.title = ''
    newReq.description = ''
    newReq.amount = null
    await loadRequests()
    activeTab.value = 'sent'
  } catch (err) {
    createError.value = err?.data?.error ?? 'Failed to send request'
  } finally {
    creating.value = false
  }
}

function confirmAccept(req) {
  confirmTarget.value = req
  confirmAction.value = 'accept'
  actionError.value = ''
}

function confirmDecline(req) {
  confirmTarget.value = req
  confirmAction.value = 'decline'
  actionError.value = ''
}

async function executeAction() {
  if (!confirmTarget.value) return
  acting.value = true
  actionError.value = ''

  const endpoint = confirmAction.value === 'accept'
    ? `/api/money-request/accept/${confirmTarget.value.id}`
    : `/api/money-request/decline/${confirmTarget.value.id}`

  try {
    await $fetch(endpoint, { method: 'POST', headers: authHeaders() })
    confirmTarget.value = null
    await fetchUser()
    await loadRequests()
  } catch (err) {
    actionError.value = err?.data?.error ?? 'Action failed. Please try again.'
  } finally {
    acting.value = false
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
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

.icon-btn:hover { background: var(--clr-card-high); }

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 0.5rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  color: var(--clr-text-sub);
  background: none;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.tab-btn.active {
  background: var(--clr-card-high);
  color: var(--clr-text);
}

.badge {
  background: var(--clr-primary);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 800;
  border-radius: 999px;
  padding: 0.1rem 0.4rem;
  min-width: 18px;
  text-align: center;
}

/* ── Request cards ── */
.request-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-card {
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 20px;
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.req-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.req-avatar { flex-shrink: 0; }

.req-img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--clr-border);
}

.req-initial {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 800;
  color: #fff;
}

.req-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.req-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--clr-text);
}

.req-date {
  font-size: 0.75rem;
  color: var(--clr-text-dim);
}

.req-amount {
  font-size: 1rem;
  font-weight: 800;
  color: var(--clr-text);
  white-space: nowrap;
}

.req-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--clr-text);
  margin: 0;
}

.req-description {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  line-height: 1.5;
  margin: 0;
}

.req-actions {
  display: flex;
  gap: 0.625rem;
  margin-top: 0.25rem;
}

.btn-accept {
  flex: 1;
  padding: 0.7rem;
  background: var(--clr-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.btn-decline {
  flex: 1;
  padding: 0.7rem;
  background: var(--clr-card-high);
  color: var(--clr-text-sub);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.req-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.req-status.accepted {
  color: var(--clr-positive);
  background: var(--clr-primary-dim);
}

.req-status.declined {
  color: var(--clr-negative);
  background: rgba(255, 92, 122, 0.1);
}

.req-status.pending {
  color: var(--clr-text-sub);
  background: var(--clr-card-high);
}

/* ── Empty & loading ── */
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
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

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

/* ── Modals ── */
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

.confirm-modal {
  max-height: 70vh;
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

.text-area {
  width: 100%;
  padding: 0.8rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-area::placeholder { color: var(--clr-text-dim); }
.text-area:focus { border-color: var(--clr-primary); }

.form-error {
  color: var(--clr-negative);
  font-size: 0.8125rem;
}

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

.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Confirm modal ── */
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  align-self: center;
  margin-bottom: 0.25rem;
}

.confirm-icon.success {
  background: var(--clr-primary-dim);
  color: var(--clr-positive);
}

.confirm-icon.danger {
  background: rgba(255, 92, 122, 0.1);
  color: var(--clr-negative);
}

.confirm-text {
  font-size: 0.9375rem;
  color: var(--clr-text-sub);
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.confirm-reason {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--clr-text);
  text-align: center;
  margin: 0;
}

.balance-hint {
  font-size: 0.8125rem;
  color: var(--clr-text-dim);
  text-align: center;
}

.confirm-buttons {
  display: flex;
  gap: 0.625rem;
}

.btn-primary {
  flex: 1;
  padding: 0.8rem;
  background: var(--clr-primary);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: opacity 0.2s;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  flex: 1;
  padding: 0.8rem;
  background: var(--clr-card-high);
  color: var(--clr-text);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.btn-danger {
  flex: 1;
  padding: 0.8rem;
  background: rgba(255, 92, 122, 0.15);
  color: var(--clr-negative);
  border: 1px solid rgba(255, 92, 122, 0.3);
  border-radius: 14px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: opacity 0.2s;
}

.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.nav-spacer { height: 100px; }
</style>
