<!-- QR code page redesigned to match home page style -->

<template>
  <div class="page">
    <header class="top-header">
      <div class="header-title">
        <h1 class="page-title">QR Code</h1>
        <span class="page-subtitle">Generate &amp; Scan</span>
      </div>
      <div class="tab-toggle">
        <div
          class="tab-slider"
          :style="{ transform: activeTab === 'generator' ? 'translateX(0)' : 'translateX(100%)' }"
        ></div>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'generator' }"
          @click="switchTab('generator')"
        >
          <Icon name="uil:qrcode-scan" />
          <span>Generate</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'camera' }"
          @click="switchTab('camera')"
        >
          <Icon name="uil:camera" />
          <span>Scan</span>
        </button>
      </div>
    </header>

    <!-- Generator tab -->
    <section v-if="activeTab === 'generator'" class="content-card generator-fade">
      <div class="card-header">
        <Icon name="mdi:qrcode" class="card-icon" />
        <div>
          <p class="card-title">Your QR Code</p>
          <p class="card-sub">Share to receive payments</p>
        </div>
      </div>

      <!-- Amount input -->
      <div class="amount-field">
        <label class="amount-label">Request amount (HUF)</label>
        <div class="amount-input-wrap">
          <input
            v-model.number="requestedAmount"
            type="number"
            min="1"
            step="1"
            class="amount-input"
            placeholder="e.g. 5000"
          />
          <span class="amount-currency">HUF</span>
        </div>
      </div>

      <div class="qr-wrapper">
        <img
          v-if="paymentLink"
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=1E1E2E&color=00D4AA&data=${encodeURIComponent(paymentLink)}`"
          alt="QR Code"
          class="qr-image"
        />
        <div v-else class="qr-placeholder">
          <Icon name="mdi:account-alert-outline" class="qr-placeholder-icon" />
          <p>Log in to generate your QR code</p>
        </div>
      </div>
      <p class="qr-hint">Scan this code to send money to you</p>
    </section>

    <!-- Scanner tab -->
    <section v-if="activeTab === 'camera'" class="content-card camera-fade">
      <div class="card-header">
        <Icon name="uil:camera" class="card-icon" />
        <div>
          <p class="card-title">Scan QR Code</p>
          <p class="card-sub">Point camera at a QR code</p>
        </div>
      </div>

      <div id="reader" class="camera-reader"></div>

      <div v-if="scannedResult" class="scan-result success">
        <Icon name="mdi:check-circle-outline" class="result-icon" />
        <div>
          <strong>Scan successful!</strong>
          <p class="result-text">{{ scannedResult }}</p>
        </div>
        <button v-if="isPaymentLink(scannedResult)" @click="goToPayment(scannedResult)" class="rescan-btn pay-now-btn">
          Pay Now
        </button>
        <button @click="startScanning" class="rescan-btn">Scan again</button>
      </div>

      <div v-else-if="scanError" class="scan-result error">
        <Icon name="mdi:alert-circle-outline" class="result-icon" />
        <p>{{ scanError }}</p>
      </div>
    </section>

    <div class="nav-spacer"></div>
    <Navigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const { user, fetchUser } = useAuth()

const requestedAmount = ref(null)
const activeTab = ref('generator')
const scannedResult = ref(null)
const scanError = ref(null)
let html5QrCode = null

const paymentLink = computed(() => {
  if (!user.value) return null
  const base = process.client ? window.location.origin : ''
  const params = new URLSearchParams({ to: user.value.id })
  if (requestedAmount.value && requestedAmount.value > 0) {
    params.set('amount', String(Math.round(requestedAmount.value)))
  }
  return `${base}/pay?${params.toString()}`
})

const isPaymentLink = (url) => {
  try {
    const u = new URL(url)
    return u.pathname === '/pay' && u.searchParams.has('to')
  } catch {
    return false
  }
}

const goToPayment = (url) => {
  navigateTo(url)
}

const switchTab = (tabName) => {
  activeTab.value = tabName
  if (tabName === 'camera') {
    scannedResult.value = null
    scanError.value = null
    startScanning()
  } else {
    stopScanning()
  }
}

const startScanning = () => {
  if (!process.client || !window.Html5Qrcode) return
  scanError.value = null
  scannedResult.value = null
  stopScanning()
  html5QrCode = new Html5Qrcode('reader')
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 220, height: 220 } },
    (decodedText) => {
      scannedResult.value = decodedText
      stopScanning()
      if (isPaymentLink(decodedText)) {
        navigateTo(decodedText)
      }
    },
    () => {}
  ).catch((err) => {
    scanError.value = `Camera error: ${err}`
  })
}

const stopScanning = () => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch(() => {})
  }
}

onMounted(async () => {
  await fetchUser()
  if (window.Html5Qrcode) return
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
  script.async = true
  document.head.appendChild(script)
})

onBeforeUnmount(() => {
  stopScanning()
})
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
  line-height: 1;
  margin-bottom: 0.2rem;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

/* ── Tab toggle ── */
.tab-toggle {
  display: flex;
  background: var(--clr-card);
  padding: 4px;
  border-radius: 14px;
  position: relative;
  border: 1px solid var(--clr-border);
}

.tab-slider {
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

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.875rem;
  border: none;
  background: none;
  color: var(--clr-text-sub);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
  font-family: inherit;
}

.tab-btn.active {
  color: #fff;
}

/* ── Content card ── */
.content-card {
  background: var(--clr-card);
  border-radius: 24px;
  border: 1px solid var(--clr-border);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.generator-fade { animation: fadeIn 0.4s ease; }
.camera-fade { animation: fadeIn 0.4s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
}

.card-icon {
  font-size: 2rem;
  color: var(--clr-primary);
  flex-shrink: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--clr-text);
}

.card-sub {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
}

/* ── QR image ── */
.qr-wrapper {
  background: var(--clr-card-high);
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid var(--clr-border);
}

.qr-image {
  display: block;
  width: 200px;
  height: 200px;
  border-radius: 8px;
}

.qr-hint {
  font-size: 0.8125rem;
  color: var(--clr-text-sub);
  text-align: center;
}

/* ── Amount field ── */
.amount-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.amount-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--clr-text-sub);
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--clr-card-high);
  border: 1px solid var(--clr-border);
  border-radius: 14px;
  padding: 0.625rem 1rem;
}

.amount-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 1rem;
  font-weight: 600;
  color: var(--clr-text);
  font-family: inherit;
  min-width: 0;
}

.amount-input::placeholder {
  color: var(--clr-text-sub);
  font-weight: 400;
}

.amount-currency {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--clr-text-sub);
}

/* ── QR placeholder (not logged in) ── */
.qr-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  color: var(--clr-text-sub);
  font-size: 0.8125rem;
  text-align: center;
}

.qr-placeholder-icon {
  font-size: 3rem;
  color: var(--clr-text-sub);
}

/* ── Pay now button (inside scan result) ── */
.pay-now-btn {
  background: var(--clr-primary);
  margin-bottom: 0.375rem;
}


.camera-reader {
  width: 100%;
  max-width: 280px;
  height: 280px;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid var(--clr-border);
}

/* ── Scan result ── */
.scan-result {
  width: 100%;
  padding: 1rem;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.scan-result.success {
  background: var(--clr-primary-dim);
  border: 1px solid rgba(0, 212, 170, 0.25);
  color: var(--clr-positive);
}

.scan-result.error {
  background: rgba(255, 92, 122, 0.1);
  border: 1px solid rgba(255, 92, 122, 0.25);
  color: var(--clr-negative);
}

.result-icon {
  font-size: 1.375rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.result-text {
  font-size: 0.8125rem;
  word-break: break-all;
  opacity: 0.85;
  margin-top: 0.25rem;
}

.rescan-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--clr-primary);
  color: #fff;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

.nav-spacer {
  height: 100px;
}
</style>
