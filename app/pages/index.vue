<script setup lang="ts">
const { isLoggedIn } = useAuth()
await navigateTo(isLoggedIn.value ? '/home' : '/loginregister', { replace: true })
</script>

<template>
  <div></div>
</template>

