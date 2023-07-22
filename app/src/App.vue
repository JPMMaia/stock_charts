<template>
  <div>
    <h1>Stock Market Chart</h1>
    <div style="width: 800px;">
      <StockChart />
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StockChart from './components/StockChart.vue';

export default defineComponent({
  name: 'App',
  components: {
    StockChart
  }
});
</script>
