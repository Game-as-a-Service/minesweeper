<script setup lang="ts">
import { ref, type Ref } from "vue";
import * as apiUser from "@/api/user";

interface User {
  account: string;
  password: string;
}

const user: Ref<User> = ref({
  account: "",
  password: "",
});

const message: Ref<string> = ref("");

async function signup() {
  message.value = "";
  message.value = (
    await apiUser.signup(user.value.account, user.value.password)
  ).data;
}
</script>

<template>
  <div class="root">
    <h1>This is an signup page</h1>
    <input v-model="user.account" type="text" placeholder="account" />
    <input v-model="user.password" type="password" placeholder="password" />
    <button @click="signup">註冊</button>
    <div class="message">{{ message }}</div>
  </div>
</template>

<style>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.root > * {
  margin: 5px;
}
.message {
  height: 10px;
}
</style>
