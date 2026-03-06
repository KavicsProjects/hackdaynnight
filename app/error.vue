<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
</script>

<template  >
  <div class="bg" >
    <h1>{{ error.status }}</h1>
    <NuxtLink to="/">Go back home</NuxtLink>
  </div>
</template>

<style lang="css" scoped>
.bg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--clr-alizarin);
  font-size: 6rem;
  color: var(--clr-clouds);
}
</style>