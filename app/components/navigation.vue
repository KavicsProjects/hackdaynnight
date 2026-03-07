<template>
  <nav class="bottom-nav">
    <div class="nav-pill">
      <NuxtLink to="/home" class="nav-item" title="Home">
        <Icon name="mdi:home-variant-outline" class="nav-icon" />
        <span class="nav-label">Home</span>
      </NuxtLink>

      <NuxtLink to="/qrgenerator" class="nav-item" title="QR">
        <Icon name="mdi:qrcode-scan" class="nav-icon" />
        <span class="nav-label">QR</span>
      </NuxtLink>

      <NuxtLink to="/tasks" class="nav-item" title="Tasks">
        <Icon name="mdi:clipboard-check-outline" class="nav-icon" />
        <span class="nav-label">Tasks</span>
      </NuxtLink>

      <NuxtLink to="/fizetesek" class="nav-item" title="Payments">
        <Icon name="mdi:swap-horizontal" class="nav-icon" />
        <span class="nav-label">Payments</span>
      </NuxtLink>

      <NuxtLink to="/requests" class="nav-item" title="Requests">
        <Icon name="mdi:hand-coin-outline" class="nav-icon" />
        <span class="nav-label">Requests</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item" title="Profile">
        <Icon name="mdi:account-outline" class="nav-icon" />
        <span class="nav-label">Profile</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 1.25rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 999;
  pointer-events: none;
}

.nav-pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem 1rem;
  background: var(--clr-card);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid var(--clr-border);
  border-radius: 2rem;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  text-decoration: none;
  color: var(--clr-text-sub);
  transition: color 0.2s, background 0.2s;
}

.nav-item:hover {
  color: var(--clr-text);
  background: var(--clr-card-high);
}

.router-link-active {
  color: var(--clr-primary);
  background: var(--clr-primary-dim);
}

.nav-icon {
  font-size: 1.375rem;
}

.nav-label {
  font-size: 0.6875rem;
  font-weight: 600;
}

@media (max-width: 360px) {
  .nav-label {
    display: none;
  }
  .nav-item {
    padding: 0.5rem 0.75rem;
  }
}
</style>
