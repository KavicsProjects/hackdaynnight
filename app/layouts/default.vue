<template>
  <div class="app-root">
    <NuxtRouteAnnouncer />
    <slot />
  </div>
</template>

<style>
.app-root {
  background: var(--clr-bg);
  min-height: 100vh;
}
</style>
