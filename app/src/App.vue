<template>
  <div>
    <h1>Stock Market Chart</h1>
    <div style="width: 800px;">
      <StockChart ref="chart" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import StockChart from './components/StockChart.vue';
import * as data_service from "./data/data_service";

const chart = ref<InstanceType<typeof StockChart> | null>(null);

onMounted(() => {
  if (chart.value !== null) {

    const api_key = "";

    // eslint-disable-next-line
    const data_promise = data_service.get_data("IBM", data_service.Metric.Time_series_montly_adjusted, api_key, localStorage, false);

    data_promise.then(
      // eslint-disable-next-line
      (data: any) => {

        const time_data = data["Monthly Adjusted Time Series"];

        const labels: string[] = Object.keys(time_data).map(value => value);
        labels.reverse();

        const values: number[] = labels.map(label => {
          const value = time_data[label];
          const open = value["1. open"];
          return Number(open);
        });

        if (chart.value !== null) {
          chart.value.set_data(labels, [{ label: "Open price", data: values }]);
        }
      }
    )
  }
});

</script>
