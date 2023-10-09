<script setup lang="ts">
import { helloWorld } from "@/lib/index";

console.log(helloWorld());
</script>

<template>
  <div class="greetings">
    <h1 class="green">MineSweeper 踩地雷</h1>
    <h3>遊戲截圖</h3>
    <img
      alt="game image"
      src="https://user-images.githubusercontent.com/4581416/212919339-82431587-cc61-49ed-b089-b4cb8aa08bb9.png"
    />
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
