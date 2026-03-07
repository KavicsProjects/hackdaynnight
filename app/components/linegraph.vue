<!-- Chart.js line graph – dark material design -->
<!-- Click event navigates to payment statistics page  -->

<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { useRouter } from 'vue-router'

const router = useRouter()

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale,
  Filler,
)

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan \'26', 'Feb \'26', 'Mar \'26'],
  datasets: [
    {
      label: 'Balance',
      backgroundColor: (ctx) => {
        const canvas = ctx.chart.ctx
        const gradient = canvas.createLinearGradient(0, 0, 0, 220)
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.3)')
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0.0)')
        return gradient
      },
      borderColor: '#00D4AA',
      pointBackgroundColor: '#00D4AA',
      pointBorderColor: '#00D4AA',
      pointRadius: 0,
      pointHoverRadius: 5,
      data: [120, 190, 150, 230, 180, 180, 310, 280, 260, 300, 250, 290, 310, 270, 320],
      tension: 0.4,
      fill: true,
      borderWidth: 2,
    },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: () => {
    router.push('/fizetesek')
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1E1E2E',
      titleColor: '#FFFFFF',
      bodyColor: '#8888AA',
      borderColor: 'rgba(255,255,255,0.07)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#8888AA',
        font: { size: 11 },
        maxRotation: 0,
      },
    },
    y: {
      grid: {
        color: 'rgba(255,255,255,0.04)',
      },
      border: {
        display: false,
        dash: [4, 4],
      },
      ticks: {
        color: '#8888AA',
        font: { size: 11 },
        padding: 8,
      },
    },
  },
  animations: {
    x: {
      type: 'number',
      easing: 'easeInOutQuart',
      duration: 600,
      from: NaN,
      delay(ctx) {
        if (ctx.type !== 'data' || ctx.xStarted) return 0
        ctx.xStarted = true
        return ctx.index * 30
      },
    },
  },
}
</script>

<template>
  <div class="graph-container">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.graph-container {
  height: 220px;
  width: 100%;
  cursor: pointer;
}
</style>
