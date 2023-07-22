<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Chart, { ChartConfiguration } from 'chart.js/auto';

export interface Dataset {
    label: string;
    data: number[];
}

const canvas = ref<HTMLCanvasElement | null>(null);

function set_data(labels: string[], datasets: Dataset[]): void {
    if (canvas.value !== null) {
        const context = canvas.value.getContext('2d');
        if (context !== null) {
            const config: ChartConfiguration = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets.map(dataset => { return { label: dataset.label, data: dataset.data }; })
                }
            };

            new Chart(context, config);
        }
    }
}

defineExpose({
    set_data
});

</script>
