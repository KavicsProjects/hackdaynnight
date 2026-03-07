<template>
  <div class="background">
    <div class="row top-row">
        <NuxtImg class="profile-pic" src="img/profile-name.jpg" />
        <h1 class="balance-text">HUF 999999</h1>
    </div>

    <div class="transaction-wrapper">
        <div v-for="(task, index) in tasks" :key="index" class="task-card">
          <h2>{{ task.title }}</h2>
          <p>{{ task.description }}</p>
        </div>
        <NuxtLink to="/transactions" title="Transactionlist">
          More
        </NuxtLink>
      </div>

  </div>
</template>

<style scoped>

</style>

<script setup>
const tasks = ref([
  {
    title: 'Review Monthly Budget',
    description: 'Analyze expenses from last month and allocate funds for upcoming utility bills.'
  },
  {
    title: 'Client Meeting',
    description: 'Discuss the new web application architecture and feature requirements.'
  },
  {
    title: 'Update Nuxt Dependencies',
    description: 'Migrate the legacy components to ensure full compatibility with Nuxt 4.'
  }
])
</script>