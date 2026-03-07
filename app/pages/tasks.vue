<template>
  <div class="page">
    <header class="top-header">
      <div>
        <h1 class="page-title">Tasks</h1>
        <span class="page-subtitle">{{ tickets.length }} available</span>
      </div>
      <button class="icon-btn" @click="showCreateModal = true" aria-label="Create task">
        <Icon name="mdi:plus" />
      </button>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- Available tasks tab -->
      <div v-if="activeTab === 'available'" class="ticket-list">
        <div v-if="availableTickets.length === 0" class="empty-state">
          <Icon name="mdi:clipboard-check-outline" class="empty-icon" />
          <p>No tasks available</p>
        </div>
        <div
          v-for="ticket in availableTickets"
          :key="ticket.id"
          class="ticket-card"
        >
          <div class="ticket-header">
            <div>
              <h3 class="ticket-title">{{ ticket.title }}</h3>
              <p class="ticket-owner">by {{ ticket.user.name }}</p>
            </div>
            <div class="reward-badge">
              <Icon name="mdi:cash" class="reward-icon" />
              <span>{{ ticket.reward.toLocaleString('hu-HU') }} HUF</span>
            </div>
          </div>
          <p class="ticket-content">{{ ticket.content }}</p>
          <div class="ticket-meta">
            <span class="meta-item">
              <Icon name="mdi:account-group" class="meta-icon" />
              {{ ticket.userTicketConnects.length }}/{{ ticket.maxParticipants }} applicants
            </span>
            <span class="meta-item">
              <Icon name="mdi:check-circle-outline" class="meta-icon" />
              {{ acceptedCount(ticket) }}/{{ ticket.maxFinishers }} completed
            </span>
            <span v-if="ticket.allowedEmails.length > 0" class="meta-item restricted">
              <Icon name="mdi:lock-outline" class="meta-icon" />
              Restricted
            </span>
          </div>
          <div class="ticket-actions">
            <button
              v-if="!isApplied(ticket) && !isOwner(ticket)"
              class="apply-btn"
              :disabled="applying === ticket.id"
              @click="applyToTask(ticket.id)"
            >
              <span v-if="applying === ticket.id" class="spinner-sm"></span>
              {{ applying === ticket.id ? 'Applying...' : 'Apply' }}
            </button>
            <button
              v-else-if="isApplied(ticket) && !isOwner(ticket) && !isCompleted(ticket) && !isAccepted(ticket)"
              class="complete-btn"
              :disabled="completing === ticket.id"
              @click="markComplete(ticket.id, true)"
            >
              <span v-if="completing === ticket.id" class="spinner-sm"></span>
              {{ completing === ticket.id ? 'Marking...' : 'Mark Complete' }}
            </button>
            <span v-else-if="isAccepted(ticket)" class="status-badge accepted">
              <Icon name="mdi:check-circle" /> Accepted
            </span>
            <span v-else-if="isCompleted(ticket) && !isAccepted(ticket)" class="status-badge pending">
              <Icon name="mdi:clock-outline" /> Pending review
            </span>
            <span v-else-if="isApplied(ticket) && isOwner(ticket)" class="status-badge owner">
              <Icon name="mdi:star" /> Your task
            </span>
          </div>
        </div>
      </div>

      <!-- My tasks (created) tab -->
      <div v-else-if="activeTab === 'mine'" class="ticket-list">
        <div v-if="myTickets.length === 0" class="empty-state">
          <Icon name="mdi:clipboard-plus-outline" class="empty-icon" />
          <p>No tasks created yet</p>
          <button class="create-btn-outline" @click="showCreateModal = true">Create Task</button>
        </div>
        <div
          v-for="ticket in myTickets"
          :key="ticket.id"
          class="ticket-card"
        >
          <div class="ticket-header">
            <div>
              <h3 class="ticket-title">{{ ticket.title }}</h3>
              <p class="ticket-date">{{ formatDate(ticket.createdAt) }}</p>
            </div>
            <div class="reward-badge">
              <Icon name="mdi:cash" class="reward-icon" />
              <span>{{ ticket.reward.toLocaleString('hu-HU') }} HUF</span>
            </div>
          </div>
          <p class="ticket-content">{{ ticket.content }}</p>
          <div class="ticket-meta">
            <span class="meta-item">
              <Icon name="mdi:account-group" class="meta-icon" />
              {{ ticket.userTicketConnects.length }} applicants
            </span>
            <span class="meta-item">
              <Icon name="mdi:check-circle-outline" class="meta-icon" />
              {{ acceptedCount(ticket) }}/{{ ticket.maxFinishers }} accepted
            </span>
          </div>
          <div v-if="ticket.allowedEmails.length > 0" class="allowed-emails">
            <span class="allowed-label">
              <Icon name="mdi:email-lock-outline" class="meta-icon" />
              Restricted to:
            </span>
            <span v-for="email in ticket.allowedEmails" :key="email" class="email-tag">{{ email }}</span>
          </div>

          <!-- Applicants section -->
          <div v-if="pendingApplicants(ticket).length > 0" class="applicants-section">
            <p class="applicants-title">Pending Review</p>
            <div v-for="conn in pendingApplicants(ticket)" :key="conn.userId" class="applicant-row">
              <span class="applicant-name">{{ conn.user.name }}</span>
              <span class="applicant-email">{{ conn.user.email }}</span>
              <button
                class="accept-btn"
                :disabled="accepting === `${ticket.id}-${conn.userId}`"
                @click="acceptCompletion(ticket.id, conn.userId)"
              >
                <span v-if="accepting === `${ticket.id}-${conn.userId}`" class="spinner-sm"></span>
                {{ accepting === `${ticket.id}-${conn.userId}` ? '...' : 'Accept' }}
              </button>
            </div>
          </div>

          <button
            class="delete-btn"
            :disabled="deleting === ticket.id"
            @click="deleteTask(ticket.id)"
          >
            <Icon name="mdi:trash-can-outline" />
            {{ deleting === ticket.id ? 'Deleting...' : 'Delete Task' }}
          </button>
        </div>
      </div>

      <!-- Applied tasks tab -->
      <div v-else-if="activeTab === 'applied'" class="ticket-list">
        <div v-if="appliedTickets.length === 0" class="empty-state">
          <Icon name="mdi:clipboard-list-outline" class="empty-icon" />
          <p>No applied tasks yet</p>
        </div>
        <div
          v-for="ticket in appliedTickets"
          :key="ticket.id"
          class="ticket-card"
        >
          <div class="ticket-header">
            <div>
              <h3 class="ticket-title">{{ ticket.title }}</h3>
              <p class="ticket-owner">by {{ ticket.user.name }}</p>
            </div>
            <div class="reward-badge">
              <Icon name="mdi:cash" class="reward-icon" />
              <span>{{ ticket.reward.toLocaleString('hu-HU') }} HUF</span>
            </div>
          </div>
          <p class="ticket-content">{{ ticket.content }}</p>
          <div class="ticket-actions">
            <button
              v-if="!isCompleted(ticket) && !isAccepted(ticket)"
              class="complete-btn"
              :disabled="completing === ticket.id"
              @click="markComplete(ticket.id, true)"
            >
              <span v-if="completing === ticket.id" class="spinner-sm"></span>
              {{ completing === ticket.id ? 'Marking...' : 'Mark Complete' }}
            </button>
            <button
              v-else-if="isCompleted(ticket) && !isAccepted(ticket)"
              class="uncomplete-btn"
              :disabled="completing === ticket.id"
              @click="markComplete(ticket.id, false)"
            >
              Unmark Complete
            </button>
            <span v-if="isAccepted(ticket)" class="status-badge accepted">
              <Icon name="mdi:check-circle" /> Accepted & Paid
            </span>
            <span v-else-if="isCompleted(ticket)" class="status-badge pending">
              <Icon name="mdi:clock-outline" /> Pending review
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Create task modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Create Task</h2>
          <button class="close-btn" @click="showCreateModal = false">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Title</label>
            <input v-model="newTask.title" type="text" placeholder="Task title" class="text-input" />
          </div>
          <div class="input-group">
            <label>Description</label>
            <textarea v-model="newTask.content" placeholder="Describe the task..." class="text-area" rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Reward per finisher (HUF)</label>
              <input v-model.number="newTask.reward" type="number" min="0" placeholder="5000" class="text-input" />
            </div>
            <div class="input-group">
              <label>Max finishers</label>
              <input v-model.number="newTask.maxFinishers" type="number" min="1" placeholder="1" class="text-input" />
            </div>
          </div>
          <div class="input-group">
            <label>Max participants</label>
            <input v-model.number="newTask.maxParticipants" type="number" min="1" placeholder="10" class="text-input" />
          </div>
          <div class="input-group">
            <label>Allowed emails (optional, leave empty for public)</label>
            <div class="email-input-row">
              <input
                v-model="emailInput"
                type="email"
                placeholder="user@example.com"
                class="text-input"
                @keyup.enter="addEmail"
              />
              <button class="add-email-btn" @click="addEmail">
                <Icon name="mdi:plus" />
              </button>
            </div>
            <div class="email-tags" v-if="newTask.allowedEmails.length > 0">
              <span
                v-for="email in newTask.allowedEmails"
                :key="email"
                class="email-tag removable"
                @click="removeEmail(email)"
              >
                {{ email }} <Icon name="mdi:close" class="tag-close" />
              </span>
            </div>
            <p class="field-hint">
              Total cost: {{ totalCost.toLocaleString('hu-HU') }} HUF
              ({{ newTask.reward || 0 }} × {{ newTask.maxFinishers || 1 }} finishers)
            </p>
          </div>
          <p v-if="createError" class="send-error">{{ createError }}</p>
          <button class="save-btn" :disabled="creating" @click="createTask">
            <span v-if="creating" class="spinner-sm"></span>
            {{ creating ? 'Creating...' : 'Create Task' }}
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
const tickets = ref([])
const activeTab = ref('available')
const applying = ref(null)
const completing = ref(null)
const accepting = ref(null)
const deleting = ref(null)
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const emailInput = ref('')
const newTask = reactive({
  title: '',
  content: '',
  reward: null,
  maxFinishers: 1,
  maxParticipants: 10,
  allowedEmails: []
})

const tabs = [
  { key: 'available', label: 'Available' },
  { key: 'applied', label: 'Applied' },
  { key: 'mine', label: 'My Tasks' }
]

const totalCost = computed(() => (newTask.reward || 0) * (newTask.maxFinishers || 1))

onMounted(async () => {
  await fetchUser()
  await loadTickets()
  loading.value = false
})

async function loadTickets() {
  try {
    const data = await $fetch('/api/ticket', { headers: authHeaders() })
    tickets.value = data.ticket ?? []
  } catch {}
}

const myUserId = computed(() => user.value?.id)

const availableTickets = computed(() =>
  tickets.value.filter(t => t.userId !== myUserId.value && !isApplied(t))
)

const myTickets = computed(() =>
  tickets.value.filter(t => t.userId === myUserId.value)
)

const appliedTickets = computed(() =>
  tickets.value.filter(t => t.userId !== myUserId.value && isApplied(t))
)

function isOwner(ticket) {
  return ticket.userId === myUserId.value
}

function isApplied(ticket) {
  return ticket.userTicketConnects.some(c => c.userId === myUserId.value)
}

function isCompleted(ticket) {
  const conn = ticket.userTicketConnects.find(c => c.userId === myUserId.value)
  return conn?.userMarkedComplete ?? false
}

function isAccepted(ticket) {
  const conn = ticket.userTicketConnects.find(c => c.userId === myUserId.value)
  return conn?.acceptedByAuthor ?? false
}

function acceptedCount(ticket) {
  return ticket.userTicketConnects.filter(c => c.acceptedByAuthor).length
}

function pendingApplicants(ticket) {
  return ticket.userTicketConnects.filter(c => c.userMarkedComplete && !c.acceptedByAuthor)
}

async function applyToTask(ticketId) {
  applying.value = ticketId
  try {
    await $fetch(`/api/ticket/subscribe/${ticketId}`, {
      method: 'POST',
      headers: authHeaders()
    })
    await loadTickets()
    activeTab.value = 'applied'
  } catch (err) {
    alert(err?.data?.error ?? 'Failed to apply')
  } finally {
    applying.value = null
  }
}

async function markComplete(ticketId, complete) {
  completing.value = ticketId
  try {
    const path = complete ? 'true' : 'false'
    await $fetch(`/api/ticket/complete/${path}/${ticketId}`, {
      method: 'POST',
      headers: authHeaders()
    })
    await loadTickets()
  } catch (err) {
    alert(err?.data?.error ?? 'Failed to update task status')
  } finally {
    completing.value = null
  }
}

async function acceptCompletion(ticketId, completorId) {
  accepting.value = `${ticketId}-${completorId}`
  try {
    await $fetch(`/api/ticket/complete/accept/${ticketId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: { completorId }
    })
    await loadTickets()
    await fetchUser()
  } catch (err) {
    alert(err?.data?.error ?? 'Failed to accept completion')
  } finally {
    accepting.value = null
  }
}

async function deleteTask(ticketId) {
  if (!confirm('Delete this task? Any unspent reward will be refunded to your account.')) return
  deleting.value = ticketId
  try {
    const result = await $fetch(`/api/ticket/${ticketId}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    await loadTickets()
    await fetchUser()
    if (result.refundAmount > 0) {
      alert(`Task deleted. ${result.refundAmount.toLocaleString('hu-HU')} HUF refunded to your account.`)
    }
  } catch (err) {
    alert(err?.data?.error ?? 'Failed to delete task')
  } finally {
    deleting.value = null
  }
}

function addEmail() {
  const email = emailInput.value.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) return
  if (!newTask.allowedEmails.includes(email)) {
    newTask.allowedEmails.push(email)
  }
  emailInput.value = ''
}

function removeEmail(email) {
  newTask.allowedEmails = newTask.allowedEmails.filter(e => e !== email)
}

async function createTask() {
  createError.value = ''
  if (!newTask.title || !newTask.content) {
    createError.value = 'Title and description are required'
    return
  }
  if (newTask.reward === null || newTask.reward < 0) {
    createError.value = 'Reward must be 0 or more'
    return
  }
  creating.value = true
  try {
    await $fetch('/api/ticket', {
      method: 'PUT',
      headers: authHeaders(),
      body: {
        title: newTask.title,
        content: newTask.content,
        reward: newTask.reward,
        maxFinishers: newTask.maxFinishers,
        maxParticipants: newTask.maxParticipants,
        allowedEmails: newTask.allowedEmails
      }
    })
    showCreateModal.value = false
    Object.assign(newTask, { title: '', content: '', reward: null, maxFinishers: 1, maxParticipants: 10, allowedEmails: [] })
    await loadTickets()
    await fetchUser()
    activeTab.value = 'mine'
  } catch (err) {
    createError.value = err?.data?.error ?? 'Failed to create task'
  } finally {
    creating.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
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

.tabs {
  display: flex;
  gap: 0.375rem;
  background: var(--clr-card);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid var(--clr-border);
}

.tab-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: none;
  color: var(--clr-text-sub);
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
}

.tab-btn.active {
  background: var(--clr-card-high);
  color: var(--clr-text);
}

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
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.ticket-card {
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.ticket-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.ticket-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--clr-text);
  margin-bottom: 0.2rem;
}

.ticket-owner, .ticket-date {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

.reward-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--clr-primary-dim);
  color: var(--clr-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.reward-icon { font-size: 1rem; }

.ticket-content {
  font-size: 0.9rem;
  color: var(--clr-text-sub);
  line-height: 1.5;
}

.ticket-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8125rem;
  color: var(--clr-text-dim);
}

.meta-item.restricted { color: var(--clr-accent); }
.meta-icon { font-size: 0.9375rem; }

.allowed-emails {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
}

.allowed-label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.email-tag {
  background: var(--clr-card-high);
  border: 1px solid var(--clr-border);
  color: var(--clr-text-sub);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.email-tag.removable {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.email-tag.removable:hover { border-color: var(--clr-negative); color: var(--clr-negative); }
.tag-close { font-size: 0.75rem; }

.ticket-actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.apply-btn {
  padding: 0.625rem 1.5rem;
  background: var(--clr-primary);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: opacity 0.2s;
}

.apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.complete-btn {
  padding: 0.625rem 1.5rem;
  background: rgba(0, 152, 239, 0.15);
  color: #0098ef;
  border: 1px solid rgba(0, 152, 239, 0.3);
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: opacity 0.2s;
}

.complete-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.uncomplete-btn {
  padding: 0.625rem 1.5rem;
  background: rgba(255, 92, 122, 0.12);
  color: var(--clr-negative);
  border: 1px solid rgba(255, 92, 122, 0.25);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.accepted {
  background: var(--clr-primary-dim);
  color: var(--clr-primary);
}

.status-badge.pending {
  background: rgba(255, 165, 0, 0.12);
  color: #ffa500;
}

.status-badge.owner {
  background: rgba(108, 99, 255, 0.12);
  color: #6c63ff;
}

.applicants-section {
  background: var(--clr-bg);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.applicants-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--clr-text-sub);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.applicant-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.applicant-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--clr-text);
}

.applicant-email {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  flex: 1;
}

.accept-btn {
  padding: 0.4rem 1rem;
  background: var(--clr-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: opacity 0.2s;
}

.accept-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.delete-btn {
  padding: 0.625rem 1rem;
  background: rgba(255, 92, 122, 0.08);
  color: var(--clr-negative);
  border: 1px solid rgba(255, 92, 122, 0.2);
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  transition: background 0.2s;
}

.delete-btn:hover { background: rgba(255, 92, 122, 0.15); }
.delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--clr-text-sub);
  text-align: center;
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--clr-text-dim);
}

.create-btn-outline {
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

/* Modal */
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
  max-height: 90vh;
  background: var(--clr-surface);
  border-radius: 28px 28px 0 0;
  border: 1px solid var(--clr-border);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--clr-border);
  position: sticky;
  top: 0;
  background: var(--clr-surface);
  z-index: 1;
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  font-weight: 600;
}

.text-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: var(--clr-card);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-input::placeholder { color: var(--clr-text-dim); }
.text-input:focus { border-color: var(--clr-primary); }

.text-area {
  width: 100%;
  padding: 0.8rem 1rem;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.email-input-row {
  display: flex;
  gap: 0.5rem;
}

.add-email-btn {
  width: 44px;
  height: 44px;
  background: var(--clr-primary);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.email-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.field-hint {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

.send-error {
  color: var(--clr-negative);
  font-size: 0.875rem;
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

.nav-spacer { height: 100px; }
</style>
