<template>
  <div class="page-container">
    <header class="header">
      <img 
        src="https://i.pravatar.cc/150?img=11" 
        alt="Profile Picture" 
        class="profile-pic" 
      />
    </header>

    <main class="main-content">
      <h1 class="balance-text">HUF 999999</h1>
    <div class="lineargraph">
        <Linegraph />
    </div>

      <section class="tasks-container">
        <div v-for="(task, index) in tasks" :key="index" class="task-card">
          <h2 class="task-title">{{ task.title }}</h2>
          <p class="task-description">{{ task.description }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

<style>
/* Reset some default browser margins for a clean look */
html, body {
  margin: 0;
  padding: 0;
  background-color: #2c3e50;
  font-family: system-ui, -apple-system, sans-serif;
  color: #ffffff;
}

.page-container {
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

/* Header with Top-Left Profile Picture */
.header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 2rem;
}

.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #34495e;
}

/* Main Content Layout */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Big Text styling */
.balance-text {
  font-size: 4rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
}


.lineargraph {
    display: flex;
    justify-content: center;
}


/* Tasks Column */
.tasks-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  width:100%;
}

.task-card {
  background-color: #34495e;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width:100px;
  flex-basis:15rem;
}

.task-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #ecf0f1;
}

.task-description {
  margin: 0;
  font-size: 1rem;
  color: #bdc3c7;
  line-height: 1.5;
}


</style>