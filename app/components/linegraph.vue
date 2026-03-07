<!-- Chart.js line graph – dark material design -->
<!-- Click event navigates to payment statistics page  -->

<script setup>
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
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

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  currentBalance: { type: Number, default: 0 },
  userId: { type: String, default: '' },
  period: { type: String, default: '1M' },
})

const router = useRouter()

ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale,
  Filler,
)

function getCutoffDate(period) {
  const now = new Date()
  const days = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }[period] ?? 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

function txEffect(tx) {
  if (tx.receiverId === props.userId) return tx.amount
  if (tx.userId === props.userId) return -tx.amount
  return 0
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })
}

const ONE_MINUTE_MS = 60_000

const balanceData = computed(() => {
  if (!props.userId || props.transactions.length === 0) {
    return { labels: ['Now'], values: [props.currentBalance] }
  }

  const allSorted = [...props.transactions].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  )

  // Compute balance before any transactions
  const totalEffect = allSorted.reduce((sum, tx) => sum + txEffect(tx), 0)
  const startBalance = props.currentBalance - totalEffect

  const cutoff = getCutoffDate(props.period)

  // Balance at start of the selected period
  const txBeforePeriod = allSorted.filter(tx => new Date(tx.createdAt) < cutoff)
  const balanceAtStart = startBalance + txBeforePeriod.reduce((sum, tx) => sum + txEffect(tx), 0)

  const txInPeriod = allSorted.filter(tx => new Date(tx.createdAt) >= cutoff)

  const labels = [formatDate(cutoff)]
  const values = [balanceAtStart]

  let balance = balanceAtStart
  for (const tx of txInPeriod) {
    balance += txEffect(tx)
    labels.push(formatDate(new Date(tx.createdAt)))
    values.push(balance)
  }

  // Add current point if last transaction wasn't very recent
  if (txInPeriod.length === 0 || new Date() - new Date(txInPeriod[txInPeriod.length - 1].createdAt) > ONE_MINUTE_MS) {
    labels.push('Now')
    values.push(props.currentBalance)
  }

  return { labels, values }
})

const chartData = computed(() => ({
  labels: balanceData.value.labels,
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
      pointRadius: 4,
      pointHoverRadius: 6,
      data: balanceData.value.values,
      tension: 0.4,
      fill: true,
      borderWidth: 2,
    },
  ],
}))

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
      callbacks: {
        label: (ctx) => `${ctx.parsed.y.toLocaleString('hu-HU')} HUF`,
      },
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
        maxTicksLimit: 6,
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
        callback: (val) => val.toLocaleString('hu-HU'),
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
