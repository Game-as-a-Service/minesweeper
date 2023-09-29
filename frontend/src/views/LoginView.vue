<script setup lang="ts">
import { reactive } from "vue";
import * as apiUser from "@/api/user";
import { useUserStore } from "@/stores/user";
import router from "@/router";

interface ViewModel {
  user: {
    account: string;
    password: string;
  };
  message: string;
}

const vm: ViewModel = reactive({
  user: {
    account: "",
    password: "",
  },
  message: "",
});

const store = useUserStore();

async function login() {
  vm.message = "";

  try {
    const res = await apiUser.login(vm.user.account, vm.user.password);
    console.log(res);

    if (res.status < 200 || res.status >= 300) {
      vm.message = res.statusText;
    } else {
      const token = res.data.access_token;
      localStorage.setItem("account", vm.user.account);
      localStorage.setItem("token", token);
      store.user.account = vm.user.account;
      store.user.token = token;
      vm.message = "login ok";
      localStorage.removeItem("waterball");
      router.push({ name: "game" });
    }
  } catch (err: any) {
    vm.message = err.message;
  }
}
</script>

<template>
  <div class="root">
    <h1>This is an login page</h1>
    <input v-model="vm.user.account" type="text" placeholder="account" />
    <input v-model="vm.user.password" type="password" placeholder="password" />
    <button @click="login">登入</button>
    <div class="message">{{ vm.message }}</div>
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
