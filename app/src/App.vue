<script setup lang="ts">
import ViewDetails from './components/ViewDetails.vue';

const symbol = "IBM";
const api_key = "CMCDBKAXZK9ADGW6";
</script>

<template>
  <div>
    <h1>{{ symbol }}</h1>
    <div style="width: 800px;">
      <Suspense>
        <ViewDetails :symbol="symbol" :api_key="api_key" />
        <template #fallback>Loading...</template>
      </Suspense>
    </div>
  </div>
</template>