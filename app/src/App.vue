<template>
  <div>
    <h1>Stock Market Chart</h1>
    <div style="width: 800px;">
      <StockChart ref="price_chart" />
    </div>
    <div style="width: 800px;">
      <StockChart ref="dividends_chart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import StockChart from './components/StockChart.vue';
import * as Data_service from "./data/Data_service";
import * as Data_transformers from "./data/Data_transformers";
import * as Server_data from "./data/Server_data";

const price_chart = ref<InstanceType<typeof StockChart> | null>(null);
const dividends_chart = ref<InstanceType<typeof StockChart> | null>(null);

onMounted(() => {
  if (price_chart.value !== null) {

    const api_key = "CMCDBKAXZK9ADGW6";

    const time_series_promise = Data_service.get_time_series_data("IBM", api_key, localStorage, false);

    time_series_promise.then(
      // eslint-disable-next-line
      (data: Server_data.Time_series_data | undefined) => {

        if (data === undefined) {
          console.log("Error: could not get time series data!");
          return;
        }


        if (price_chart.value !== null) {
          const chart_data = Data_transformers.group_time_series_by_year(data.entries);
          price_chart.value.set_data(chart_data.labels, [chart_data.datasets[0]], "bar");
        }

        if (dividends_chart.value !== null) {
          const chart_data = Data_transformers.get_dividends(data.entries);
          dividends_chart.value.set_data(chart_data.labels, chart_data.datasets, "bar");
        }
      }
    )
  }
});

</script>
