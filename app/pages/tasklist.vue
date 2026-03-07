<template>
  <div class="page-wrapper">
    <div class="row top-row">
        <NuxtImg class="profile-pic" src="img/profile-name.jpg" />
        <h1 class="balance-text">HUF 999999</h1>
    </div>

    <main class="row middle-row">
      <div class="tasks-container">
        <div class="task-card">
          <h2 class="task-title">ASDF</h2>
          <p class="task-description">LOL</p>
        </div>

                <div class="task-card">
          <h2 class="task-title">ASDF</h2>
          <p class="task-description">LOL</p>
        </div>

                <div class="task-card">
          <h2 class="task-title">ASDF</h2>
          <p class="task-description">LOL</p>
        </div>
      </div>
    </main>

    <div class="row bottom-row">
      <button class="btn btn-secondary">Other</button>
      <button class="btn btn-primary">Transaction List</button>
    </div>
  </div>
</template>

<style>
/* Reset and Base Styles */
html, body {
  margin: 0;
  padding: 0;
  background-color: #2c3e50;
  font-family: system-ui, -apple-system, sans-serif;
  color: #ffffff;
}

.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Common Row Padding */
.row {
  padding: 2rem;
  box-sizing: border-box;
}

/* --- ROW 1: Top Row --- */
.top-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-pic {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #34495e;
}

.balance-text {
  font-size: 3rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -1px;
}

/* --- ROW 2: Middle Row (Darker Background) --- */
.middle-row {
  background-color: #1a252f; /* Darker than the base #2c3e50 */
  display: flex;
  justify-content: center;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-height: 150px;
  max-width: 800px;
}

.task-card {
  background-color: #2c3e50; /* Cards match the original base color */
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
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

/* --- ROW 3: Bottom Row --- */
.bottom-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Button Base Styles */
.btn {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

/* Primary Button (Transaction List - Off-White) */
.btn-primary {
  background-color: #ecf0f1;
  color: #2c3e50; /* Dark text for contrast */
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-primary:hover {
  background-color: #ffffff;
  transform: translateY(-1px);
}

/* Secondary Button (Other) */
.btn-secondary {
  background-color: transparent;
  color: #ecf0f1;
  border: 2px solid #7f8c8d;
}

.btn-secondary:hover {
  background-color: #34495e;
  border-color: #bdc3c7;
}
</style>