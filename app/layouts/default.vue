<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <slot />
  </div>
</template>

<script setup>
const { initTheme } = useTheme()
onMounted(() => initTheme())
</script>

<style>
.app-root {
  background: var(--clr-bg);
  min-height: 100vh;
}
</style>
