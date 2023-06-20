import { ref, type Ref } from "vue";
import { defineStore } from "pinia";

interface User {
  account: string;
  token: string;
}

export const useUserStore = defineStore("user", () => {
  const user: Ref<User> = ref({
    account: "",
    token: "",
  });

  return { user };
});
