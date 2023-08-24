<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useUserStore } from "./stores/user";

const store = useUserStore();

onMounted(() => {
  const account = localStorage.getItem("account");
  const token = localStorage.getItem("token");

  if (account && token) {
    store.user.account = account;
    store.user.token = token;
  }
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
