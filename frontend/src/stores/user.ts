import { reactive, ref, type Ref } from "vue";
import { defineStore } from "pinia";

interface User {
  account: string;
  token: string;
}

export const useUserStore = defineStore("user", () => {
  const user: User = reactive({
    account: "",
    token: "",
  });

  function logout() {
    localStorage.setItem("account", "");
    localStorage.setItem("token", "");
    user.account = "";
    user.token = "";
  }

  return { user, logout };
});
