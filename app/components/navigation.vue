<template>
  <nav class="bottom-header-container">
    <div class="glass-dock">
      <NuxtLink to="/" class="nav-item" title="Home">
        <div class="icon-wrapper">
          <Icon class="icon" name="mdi:home-variant" />
        </div>
      </NuxtLink>

      <NuxtLink to="/explore" class="nav-item" title="Explore">
        <div class="icon-wrapper">
          <Icon class="icon" name="mdi:home-variant" />
        </div>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-item" title="Profile">
        <div class="icon-wrapper">
          <Icon class="icon" name="mdi:home-variant" />
        </div>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
/* Container to position the "header" at the bottom */
.bottom-header-container {
  position: fixed;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 999;
  pointer-events: none; /* Let clicks pass through background */
}

/* The Glassmorphic Dock */
.glass-dock {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(76, 240, 11, 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Smooth hover scaling for the whole dock */
.glass-dock:hover {
  transform: translateY(-5px) scale(1.02);
}

/* Individual Nav Items */
.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: transparent;
}

.icon {
  width: 24px;
  height: 24px;
  fill: rgba(255, 255, 255, 0.6);
  transition: fill 0.3s ease, filter 0.3s ease;
}

/* Fancy Hover Effects */
.nav-item:hover .icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-8px);
}

.nav-item:hover .icon {
  fill: #fff;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

/* Active State (Nuxt automatic class) */
.router-link-active .icon {
  fill: #3b82f6; /* Fancy Blue */
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
}


.router-link-active .active-indicator {
  opacity: 1;
  transform: scale(1.5);
}

/* Responsive tweak for smaller screens */
@media (max-width: 480px) {
  .bottom-header-container {
    bottom: 1rem;
  }
  .glass-dock {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
}
</style>