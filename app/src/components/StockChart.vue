<template>
    <div>
        <canvas ref="canvas"></canvas>
        <div>
            <button @click="set_x_range(Time.days_ago(7), Time.now())" :disabled="is_animating">7D</button>
            <button @click="set_x_range(Time.months_ago(1), Time.now())" :disabled="is_animating">1M</button>
            <button @click="set_x_range(Time.months_ago(3), Time.now())" :disabled="is_animating">3M</button>
            <button @click="set_x_range(Time.years_ago(1), Time.now())" :disabled="is_animating">1Y</button>
            <button @click="set_x_range(Time.years_ago(3), Time.now())" :disabled="is_animating">3Y</button>
            <button @click="set_x_range(Time.years_ago(5), Time.now())" :disabled="is_animating">5Y</button>
            <button @click="set_x_range(Time.years_ago(10), Time.now())" :disabled="is_animating">10Y</button>
            <button @click="set_x_range(Time.years_ago(20), Time.now())" :disabled="is_animating">20Y</button>
            <button @click="clear_x_range()" :disabled="is_animating">Max</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Chart, { ChartConfiguration, ChartTypeRegistry } from 'chart.js/auto';

import * as Chart_data from "../data/Chart_data";
import * as Time from "../data/Time";

const properties = defineProps<{
    labels: string[],
    datasets: Chart_data.Dataset[];
    type: keyof ChartTypeRegistry;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const is_animating = ref<boolean>(true);

const chart_configuration = ref<ChartConfiguration>(
    {
        type: properties.type,
        data: {
            labels: properties.labels,
            datasets: properties.datasets
        },
        options: {
            animation: {
                onComplete: on_animation_complete,
            },
            responsive: true,
            scales: {
                x: {
                    type: "time",
                    min: Time.years_ago(20).getTime(),
                    max: Time.now().getTime()
                },
                y: {
                    min: 0
                }
            }
        }
    }
);

const chart = ref<Chart | null>(null);

function update() {
    if (canvas.value !== null) {

        if (chart.value !== null) {
            chart.value.stop();
            chart.value.destroy();
        }

        const context = canvas.value.getContext('2d');
        if (context !== null) {
            chart.value = new Chart(context, chart_configuration.value);
        }
    }
}

function clear_x_range(): void {

    if (is_animating.value) {
        return;
    }

    is_animating.value = true;

    if (chart_configuration.value.options !== undefined) {
        chart_configuration.value.options.scales = {
            x: {
                type: "time",
            },
            y: {
                min: 0
            }
        };

        update();
    }
}

function set_x_range(min_date: Date, max_date: Date): void {

    if (is_animating.value) {
        return;
    }

    is_animating.value = true;

    if (chart_configuration.value.options !== undefined) {
        chart_configuration.value.options.scales = {
            x: {
                type: "time",
                min: min_date.getTime(),
                max: max_date.getTime()
            },
            y: {
                min: 0
            }
        };

        update();
    }
}

function on_animation_complete(animation): void {
    is_animating.value = false;
}

onMounted(() => {
    update();
});

</script>
