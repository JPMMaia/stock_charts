<template>
    <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Chart, { ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';

import * as Chart_data from "../data/Chart_data";

const canvas = ref<HTMLCanvasElement | null>(null);

function set_data(labels: string[], datasets: Chart_data.Dataset[], type: keyof ChartTypeRegistry): void {
    if (canvas.value !== null) {
        const context = canvas.value.getContext('2d');
        if (context !== null) {
            const config: ChartConfiguration = {
                type: type,
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
