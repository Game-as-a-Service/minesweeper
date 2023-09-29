<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderView from "@/layout/HeaderView.vue";
</script>

<template>
  <div class="root">
    <HeaderView />
    <div class="router-view">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
}

.router-view {
  min-height: 100vh;
}
</style>
