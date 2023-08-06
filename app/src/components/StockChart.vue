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
        <div>{{ properties.description }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Chart, { ChartConfigurationCustomTypesPerDataset } from 'chart.js/auto';

import * as Chart_data from "../data/Chart_data";
import * as Time from "../data/Time";

const properties = defineProps<{
    chart_data: Chart_data.Chart_data;
    description: string;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const is_animating = ref<boolean>(true);

const chart_configuration = ref<ChartConfigurationCustomTypesPerDataset>(
    {
        data: {
            labels: properties.chart_data.labels,
            datasets: properties.chart_data.datasets
        },
        options: {
            animation: {
                onComplete: on_animation_complete,
            },
            responsive: true,
            scales: create_scales(properties.chart_data.x_scale_options, properties.chart_data.datasets)
        }
    }
);

const chart = ref<Chart | null>(null);

function format_big_number(num: number, digits: number): string {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "Q" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup.slice().reverse().find(function (item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + " " + item.symbol : "0";
}

function create_ticks_callback(units: string | undefined): unknown {
    if (units === undefined) {
        return undefined;
    }
    else if (units === "percentage") {
        return function (value: number, index: number, values: number[]) {
            return (value * 100).toFixed(0) + '%';
        };
    }
    else {
        return function (value: number, index: number, values: number[]) {
            return format_big_number(value, 6) + " " + units;
        };
    }
}

function create_scale(options: Chart_data.Scale_options): unknown {

    const object: { [key: string]: any } = {
        type: options.type,
        position: options.position,
        min: options.min,
        max: options.max,
    };

    if (options.type === "time") {
        object["time"] = {
            unit: options.units
        };
    }
    else {
        if (options.units !== undefined) {
            object["ticks"] = {
                callback: create_ticks_callback(options.units)
            };
        }
    }

    return object;
}

function create_scales(x_scale_options: Chart_data.Scale_options, datasets: Chart_data.Dataset[]) {
    const object: { [key: string]: any } = {};

    object["x"] = create_scale(x_scale_options);

    for (const dataset of datasets) {
        if (dataset.y_scale_options !== undefined) {
            object[dataset.y_scale_options.axis_ID] = create_scale(dataset.y_scale_options);
        }
    }

    return object;
}

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
