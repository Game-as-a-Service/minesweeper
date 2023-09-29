<script setup lang="ts">
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import { useUserStore } from "./stores/user";
import { useSocketStore } from "./stores/socket";

const store = useUserStore();
const socketStore = useSocketStore();

onMounted(() => {
  const account = localStorage.getItem("account");
  const token = localStorage.getItem("token");

  if (account && token) {
    store.user.account = account;
    store.user.token = token;
  }

  socketStore.connect();
});
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
