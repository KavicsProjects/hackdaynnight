<!-- Chart.js library-->
<!-- vue/chartjs wrapper -->
<!-- Temporary data locally declared here-->
 <!-- ClickEvent: takes you to the page about payment statistics -->

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
  LinearScale 
} from 'chart.js'
import { useRouter } from 'vue-router'

const router = useRouter()


ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const chartData = {
  labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
  datasets: [
    {
      label: 'Egyenleg',
      backgroundColor: '#a913d6', //purple
      borderColor: '#a913d6',     //purple
      data: [120, 190, 150, 230, 180, 180, 310, 280, 260, 300, 250, 290, 310, 270, 250],
      tension: 0.4       //set the curve of the line (0-1)
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  onClick: () => {        
    router.push('/fizetesek');         //takes you to the page about payment statistics
  },
  plugins: {
    legend: {
      display: false,      //set it true to display legend
      position: 'bottom'
    }
  },
  
  // loading animation
  animations: {
    radius: {
      duration: 400,
      easing: 'linear',
      loop: (context) => context.active
    },
    x: {
      type: 'number',
      easing: 'linear',
      duration: 1,
      from: NaN,
      delay(ctx) {
        if (ctx.type !== 'data' || ctx.xStarted) {
          return 0;
        }
        ctx.xStarted = true;
        return ctx.index * 40; // speed of the animation
      }
    }
  }



}
</script>

<template>
  <div style="height: 400px; width: 90%; cursor: pointer; background-color: #f0f8ff; border-radius: 15px; padding: 10px;">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>