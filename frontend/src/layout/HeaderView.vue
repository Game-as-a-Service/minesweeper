<script setup lang="ts">
import { RouterLink } from "vue-router";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { useSocketStore } from "@/stores/socket";

const store = useUserStore();
const socketStore = useSocketStore();

function isLogin() {
  return store.user.account === "";
}

function logout() {
  store.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <div style="width: 200px">
          Network:
          {{ socketStore.state.connected ? "Connected" : "Disconnected" }}
        </div>
        <div style="width: 100px">Ping: {{ socketStore.state.ping }}</div>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/game">Game</RouterLink>
        <RouterLink v-if="isLogin()" to="/login">Login</RouterLink>
        <RouterLink v-if="isLogin()" to="/signup">Signup</RouterLink>
        <div v-if="!isLogin()">
          <a @click="logout">Logout</a>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  display: flex;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
