<template>
  <div class="background page">
    <div>
      <NuxtImg class="profile-pic" src="img/profile-name.jpg" />
    </div>

    <h1>HUF {{ balance }}</h1>
    <div>
      <div class="graph">
        <Linegraph />
      </div>
    </div>
    <section class="tasks-transactions">

      <div class="task-wrapper">
        <div v-for="(task, index) in tasks" :key="index" class="task-card">
          <h2>{{ task.title }}</h2>
          <p>{{ task.description }}</p>
        </div>
        <NuxtLink to="/tasklist" title="Tasks">
          More
        </NuxtLink>
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
    </section>

  </div>

</template>

<style scoped>
.page {
  display: grid;
  grid-template-areas: "profile"
    "balance"
    "graph"
    "tasks-transactions";

  min-height: 100vh;
  padding: 30px;
  gap: 1rem;
}

.profile-pic {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.graph {
  grid-area: graph;
  display: grid;
  place-items: center;
}

.task-wrapper,
.transaction-wrapper {
  display: grid;
  gap: 20px;
  position: relative;
  width: fit-content;
  place-self: center;
  border-radius: 25px;
  padding: 20px;
  background-color: var(--clr-wet-asphalt);

  & a {
    text-align: center;
  }
}

.task-wrapper::after,
.transaction-wrapper::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(transparent 30%, rgba(0, 0, 0, 0.3) 90%);
  border-radius: 25px;
  pointer-events: none;
}

.tasks-transactions  {
  display: flex;
  grid-area: tasks-transactions;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}


</style>

<script setup>

import { ref } from 'vue'

const balance = 99999;

// Mock data for the tasks column
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
