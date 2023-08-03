<script setup lang="ts">
import StockChart from "./StockChart.vue";

import * as Data_service from "../data/Data_service";
import * as Data_transformers from "../data/Data_transformers";

const properties = defineProps<{
    symbol: string;
    api_key: string;
}>();

const time_series_data = await Data_service.get_time_series_data(properties.symbol, properties.api_key, localStorage, false);

if (time_series_data === undefined) {
    throw new Error("Could not get time series data!");
}

const price_chart_data = Data_transformers.create_price_chart(time_series_data.entries);
const dividend_chart_data = Data_transformers.create_dividend_chart(time_series_data.entries);

</script>

<template>
    <div>
        <StockChart :labels="price_chart_data.labels" :datasets="price_chart_data.datasets" type="line"></StockChart>
        <StockChart :labels="dividend_chart_data.labels" :datasets="dividend_chart_data.datasets" type="bar"></StockChart>
    </div>
</template>
