<template>
    <canvas ref="stockChartCanvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Chart from 'chart.js/auto';

const stockData = [
    { month: 'January', price: 100 },
    { month: 'February', price: 120 },
    { month: 'March', price: 110 },
    { month: 'April', price: 130 },
    { month: 'May', price: 125 },
    { month: 'June', price: 140 },
];

const stockChartCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
    if (stockChartCanvas.value !== null) {
        const context = stockChartCanvas.value.getContext('2d');
        if (context !== null) {
            new Chart(
                context,
                {
                    type: 'line',
                    data: {
                        labels: stockData.map(row => row.month),
                        datasets: [
                            {
                                label: "Price by month",
                                data: stockData.map(row => row.price),
                                borderColor: 'blue',
                                fill: false
                            }
                        ]
                    }
                }
            );
        }
    }
});
</script>
