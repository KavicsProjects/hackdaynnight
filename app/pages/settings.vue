<template>
  <div class="page">
    <header class="top-header">
      <NuxtLink to="/profile" class="icon-btn" aria-label="Back">
        <Icon name="mdi:arrow-left" />
      </NuxtLink>
      <h1 class="page-title">Account Settings</h1>
      <div style="width: 40px;"></div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <template v-else-if="user">
      <!-- Profile picture -->
      <section class="settings-card">
        <p class="card-label">Profile Picture</p>
        <div class="avatar-row">
          <div class="avatar-wrap">
            <img
              v-if="previewUrl || user.profilePicture"
              :src="previewUrl || user.profilePicture"
              :alt="user.name"
              class="avatar"
            />
            <div v-else class="avatar-placeholder">
              <span>{{ user.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="avatar-actions">
            <p class="avatar-hint">Enter a URL for your profile picture</p>
            <div class="input-wrap">
              <Icon name="mdi:link" class="input-icon" />
              <input
                v-model="pictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                class="text-input"
                @input="previewUrl = pictureUrl"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Name -->
      <section class="settings-card">
        <p class="card-label">Display Name</p>
        <div class="input-wrap">
          <Icon name="mdi:account-outline" class="input-icon" />
          <input
            v-model="displayName"
            type="text"
            placeholder="Your name"
            class="text-input"
          />
        </div>
      </section>

      <!-- Account info (read-only) -->
      <section class="settings-card">
        <p class="card-label">Account Info</p>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Balance</span>
          <span class="info-value positive">{{ user.balance.toLocaleString('hu-HU') }} HUF</span>
        </div>
        <div class="info-row">
          <span class="info-label">Member since</span>
          <span class="info-value">{{ formatDate(user.createdAt) }}</span>
        </div>
      </section>

      <!-- Theme -->
      <section class="settings-card">
        <p class="card-label">Appearance</p>
        <div class="theme-row">
          <button
            class="theme-btn"
            :class="{ active: theme === 'dark' }"
            @click="applyTheme('dark')"
          >
            <Icon name="mdi:weather-night" class="theme-icon" />
            <span>Dark</span>
          </button>
          <button
            class="theme-btn"
            :class="{ active: theme === 'light' }"
            @click="applyTheme('light')"
          >
            <Icon name="mdi:white-balance-sunny" class="theme-icon" />
            <span>Light</span>
          </button>
        </div>
      </section>

      <!-- Save button -->
      <button class="save-btn" :disabled="saving" @click="saveSettings">
        <span v-if="saving" class="spinner-sm"></span>
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>

      <p v-if="successMsg" class="status-msg success">
        <Icon name="mdi:check-circle-outline" /> {{ successMsg }}
      </p>
      <p v-if="errorMsg" class="status-msg error">
        <Icon name="mdi:alert-circle-outline" /> {{ errorMsg }}
      </p>
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
const { user, fetchUser, authHeaders } = useAuth()
const { theme, applyTheme } = useTheme()

const loading = ref(true)
const saving = ref(false)
const displayName = ref('')
const pictureUrl = ref('')
const previewUrl = ref('')
const successMsg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    displayName.value = user.value.name
    pictureUrl.value = user.value.profilePicture ?? ''
    previewUrl.value = user.value.profilePicture ?? ''
  }
  loading.value = false
})

async function saveSettings() {
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  const payload = {}
  if (displayName.value.trim() && displayName.value.trim() !== user.value?.name) {
    payload.name = displayName.value.trim()
  }
  if (pictureUrl.value !== (user.value?.profilePicture ?? '')) {
    payload.profilePicture = pictureUrl.value || null
  }

  if (Object.keys(payload).length === 0) {
    errorMsg.value = 'No changes to save'
    saving.value = false
    return
  }

  try {
    const data = await $fetch('/api/user/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: payload
    })
    user.value.name = data.user.name
    user.value.profilePicture = data.user.profilePicture
    successMsg.value = 'Changes saved successfully!'
  } catch (err) {
    errorMsg.value = err?.data?.error ?? 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })
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
  font-size: 1.125rem;
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

/* ── Settings card ── */
.settings-card {
  background: var(--clr-card);
  border-radius: 20px;
  border: 1px solid var(--clr-border);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.card-label {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Avatar row ── */
.avatar-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--clr-primary);
}

.avatar-placeholder {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--clr-primary), var(--clr-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
}

.avatar-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-hint {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

/* ── Inputs ── */
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
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  outline: none;
  color: var(--clr-text);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.text-input::placeholder {
  color: var(--clr-text-dim);
}

.text-input:focus {
  border-color: var(--clr-primary);
}

/* ── Info rows ── */
.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--clr-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: var(--clr-text-sub);
}

.info-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--clr-text);
}

.info-value.positive {
  color: var(--clr-positive);
}

/* ── Save button ── */
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

/* ── Theme selector ── */
.theme-row {
  display: flex;
  gap: 0.75rem;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.875rem 0.5rem;
  background: var(--clr-surface);
  border: 2px solid var(--clr-border);
  border-radius: 14px;
  color: var(--clr-text-sub);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.theme-btn.active {
  border-color: var(--clr-primary);
  color: var(--clr-primary);
  background: var(--clr-primary-dim);
}

.theme-btn:hover:not(.active) {
  background: var(--clr-card-high);
}

.theme-icon {
  font-size: 1.5rem;
}

/* ── Status messages ── */
.status-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
}

.status-msg.success {
  background: var(--clr-primary-dim);
  color: var(--clr-positive);
  border: 1px solid rgba(0, 212, 170, 0.25);
}

.status-msg.error {
  background: rgba(255, 92, 122, 0.1);
  color: var(--clr-negative);
  border: 1px solid rgba(255, 92, 122, 0.25);
}

/* ── Empty state ── */
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
}

.nav-spacer {
  height: 100px;
}
</style>
